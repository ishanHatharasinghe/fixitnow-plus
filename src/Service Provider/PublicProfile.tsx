import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { reviewService } from "../services/reviewService";
import MessageButton from "../Components/MessageButton";
import ReviewsList from "../Components/ReviewsList";
import { bookingService } from "../services/bookingService";
import { notificationService } from "../services/notificationService";
import BookingCalendar from "../Components/BookingCalendar";
import {
  MapPin,
  Phone,
  Mail,
  Heart,
  User,
  X,
  List,
  Star,
  ChevronLeft,
  Loader,
  MoreVertical,
  Edit,
  Trash2,
} from "lucide-react";
import DeleteConfirmationModal from "../Components/DeleteConfirmationModal";

// ─── Types ────────────────────────────────────────────────────────────────────

type ProfileTab = "posts" | "reviews";

// ─── Cover Image ──────────────────────────────────────────────────────────────

const COVER_IMG =
  "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&q=80";

// ─── Bulletproof date converter ───────────────────────────────────────────────

function toDateSafe(value: any): Date {
  if (!value) return new Date(0);
  if (typeof value?.toDate === "function") {
    try {
      return value.toDate();
    } catch {
      return new Date(0);
    }
  }
  if (value instanceof Date) return isNaN(value.getTime()) ? new Date(0) : value;
  if (typeof value === "object" && typeof value.seconds === "number") {
    return new Date(value.seconds * 1000);
  }
  if (typeof value === "string" || typeof value === "number") {
    const d = new Date(value);
    return isNaN(d.getTime()) ? new Date(0) : d;
  }
  return new Date(0);
}

// ─── Helper: Retry failed requests ────────────────────────────────────────────

/**
 * Retry a failed operation with exponential backoff.
 * Useful for handling transient network/Firestore errors.
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  initialDelayMs = 500
): Promise<T> {
  let lastError: any;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      console.warn(
        `[PublicProfile] Attempt ${attempt + 1}/${maxRetries} failed:`,
        err
      );
      if (attempt < maxRetries - 1) {
        const delayMs = initialDelayMs * Math.pow(2, attempt);
        console.log(`[PublicProfile] Retrying in ${delayMs}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }
  throw lastError;
}

// ─── Direct Firestore fetchers ────────────────────────────────────────────────

/**
 * Fetch a single user document safely with robust fallbacks.
 * FIX: Maps both `profilePicture` (Firestore field) and `photoURL` (Firebase Auth
 * field) so the profile image always resolves correctly.
 * Also provides fallback values for email, phone, and other fields.
 */
async function fetchUserDoc(uid: string): Promise<any | null> {
  try {
    const snap = await getDoc(doc(db, "users", uid));
    if (!snap.exists()) {
      console.warn("[PublicProfile] No user doc found for uid:", uid);
      return null;
    }
    const data = snap.data();
    console.log("[PublicProfile] Fetched user doc:", uid, data); // debug — remove after confirming
    
    // Normalize all possible image fields for reliability
    const profileImage = data.profilePicture || data.photoURL || data.avatar || data.image || "";
    
    // Normalize email field - check multiple possible field names
    const email = data.email || data.userEmail || data.contactEmail || "";
    
    // Normalize phone field - check multiple possible field names
    const phone = data.phoneNumber || data.phone || data.mobileNumber || data.contactPhone || "";
    
    return {
      ...data,
      uid: snap.id,
      // Normalise the profile picture field — Firestore stores it as
      // `profilePicture`; Firebase Auth uses `photoURL`. Accept both.
      profilePicture: profileImage,
      photoURL: profileImage, // Also set photoURL for consistency
      // Normalise email and phone
      email: email || "",
      phoneNumber: phone || "",
      phone: phone || "",
      // Ensure other fields have safe defaults
      bio: data.bio || "",
      address: data.address || "",
      availableServices: Array.isArray(data.availableServices) ? data.availableServices : [],
      createdAt: toDateSafe(data.createdAt),
      updatedAt: toDateSafe(data.updatedAt),
    };
  } catch (err) {
    console.error("[PublicProfile] fetchUserDoc error:", err);
    throw err;
  }
}

/**
 * Fetch posts for a service provider.
 *
 * FIX: Removed the second `where("status", "==", "approved")` clause.
 * Two `where()` clauses on different fields require a composite Firestore index
 * that is NOT auto-created — the query silently returns 0 results on projects
 * that haven't manually built that index.
 * Instead, we fetch by `serviceProviderId` only (single-field index, always
 * auto-created) and filter `status === "approved"` client-side.
 */
async function fetchProviderPosts(serviceProviderId: string): Promise<any[]> {
  const snap = await getDocs(
    query(
      collection(db, "posts"),
      where("serviceProviderId", "==", serviceProviderId)
      // ✅ No second where() — avoids composite-index requirement
    )
  );

  return snap.docs
    .map((d) => {
      const data = d.data();
      return {
        ...data,
        id: d.id,
        status: data.status || "pending",
        createdAt: toDateSafe(data.createdAt),
        updatedAt: toDateSafe(data.updatedAt),
      };
    })
    .filter((p) => p.status === "approved") // ✅ Filter approved client-side
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

/** Fetch reviews for a service provider */
async function fetchReviews(serviceProviderId: string): Promise<any[]> {
  const snap = await getDocs(
    query(
      collection(db, "reviews"),
      where("serviceProviderId", "==", serviceProviderId)
    )
  );
  return snap.docs
    .map((d) => {
      const data = d.data();
      return {
        ...data,
        id: d.id,
        createdAt: toDateSafe(data.createdAt),
      };
    })
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

/** Submit a new review directly to Firestore */
async function submitReview(payload: {
  serviceProviderId: string;
  reviewerId: string;
  reviewerName: string;
  reviewerAvatar: string;
  comment: string;
  rating: number;
}): Promise<void> {
  await addDoc(collection(db, "reviews"), {
    ...payload,
    status: "active",
    likes: 0,
    helpful: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

// ─── Full Details Modal ───────────────────────────────────────────────────────

const FullDetailsModal = ({
  card,
  onClose,
}: {
  card: any;
  onClose: () => void;
}) => {
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const details = [
    {
      label: "Included Services Checklist",
      value: Array.isArray(card.checklist)
        ? card.checklist.join(", ")
        : card.includedServices || "Not specified",
    },
    {
      label: "Requirement of Client Provided Materials",
      value: card.clientMaterials || "Not specified",
    },
    { label: "Pricing Model", value: card.pricingModel || "Not specified" },
    {
      label: "Starting Price",
      value: card.startingPrice
        ? `LKR ${Number(card.startingPrice).toLocaleString()}`
        : "Not specified",
    },
    {
      label: "Inspection Fee",
      value: card.inspectionFee
        ? `LKR ${Number(card.inspectionFee).toLocaleString()}`
        : "Not specified",
    },
    {
      label: "Specific Cities",
      value: card.specificCities || "Not specified",
    },
    {
      label: "Maximum Travel Distance",
      value: card.travelDistance || "Not specified",
    },
    {
      label: "Available Days",
      value: Array.isArray(card.availableDays)
        ? card.availableDays.join(", ")
        : card.availableDays || "Not specified",
    },
    {
      label: "Available Hours",
      value: card.timeFromHour
        ? `${card.timeFromHour}:00 ${card.timeFromAmPm} – ${card.timeToHour}:00 ${card.timeToAmPm}`
        : card.availableHours || "Not specified",
    },
    {
      label: "Emergency Availability",
      value: card.emergency || "Not specified",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-[#0072D1]/30 overflow-hidden max-h-[90vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-gray-100 hover:bg-red-100 hover:text-red-500 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="overflow-y-auto flex-1 p-6 md:p-8">
          <h2 className="font-black text-gray-900 text-xl md:text-2xl leading-tight mb-1 pr-8">
            {card.title}
          </h2>
          <div className="flex items-center gap-1.5 text-gray-400 mb-5">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="text-sm font-medium">{card.location}</span>
          </div>

          <div className="flex flex-col md:flex-row gap-6 md:gap-8">
            {/* Images */}
            <div className="w-full md:w-[52%] flex-shrink-0">
              <div className="relative rounded-2xl overflow-hidden bg-gray-100">
                {card.images && card.images.length > 0 ? (
                  <>
                    <img
                      src={card.images[activeImg]}
                      alt={card.title}
                      className="w-full h-56 md:h-[360px] object-cover"
                    />
                    {card.images.length > 1 && (
                      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
                        {card.images.map((_: any, i: number) => (
                          <button
                            key={i}
                            onClick={() => setActiveImg(i)}
                            className={`rounded-full transition-all duration-200 ${
                              i === activeImg
                                ? "bg-[#0072D1] w-5 h-2.5"
                                : "bg-gray-400/70 w-2.5 h-2.5 hover:bg-gray-600"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-56 md:h-[360px] flex items-center justify-center">
                    <span className="text-sm text-gray-400">
                      No images uploaded
                    </span>
                  </div>
                )}
              </div>
              <div className="mt-5">
                <div className="flex items-center gap-2 mb-2">
                  <List className="w-4 h-4 text-gray-600" />
                  <h3 className="font-black text-gray-800 text-base">
                    Details
                  </h3>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {card.description}
                </p>
              </div>
            </div>

            {/* Info rows */}
            <div className="flex-1 min-w-0">
              <div className="space-y-3">
                {details.map(({ label, value }) => (
                  <p key={label} className="text-sm text-gray-900 leading-snug">
                    <span className="font-black">{label}: </span>
                    <span className="font-normal text-gray-700">{value}</span>
                  </p>
                ))}
              </div>
              <div className="mt-6 pt-5 border-t border-gray-100">
                <div className="flex flex-wrap items-center gap-5 mb-4">
                  <span className="flex items-center gap-1.5 text-sm font-bold text-gray-800">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    +94 {card.mobile || card.phone || "—"}
                  </span>
                  <span className="flex items-center gap-1.5 text-sm font-bold text-gray-800">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    {card.email || "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Post Card ────────────────────────────────────────────────────────────────

const PostCard = ({
  post,
  onViewDetails,
}: {
  post: any;
  onViewDetails: (post: any) => void;
}) => (
  <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="relative">
      {post.images && post.images.length > 0 ? (
        <img
          src={post.images[0]}
          alt={post.title}
          className="w-full h-44 object-cover"
        />
      ) : (
        <div className="w-full h-44 bg-gray-100 flex items-center justify-center">
          <span className="text-sm text-gray-400">No image</span>
        </div>
      )}
      <span className="absolute top-3 left-3 text-xs font-bold px-3 py-1 rounded-full shadow-sm bg-green-100 text-green-800">
        Available
      </span>
    </div>
    <div className="p-4 border-x border-b border-[#FF5A00]/30 rounded-b-2xl">
      <h3 className="font-black text-gray-900 text-base leading-snug mb-1">
        {post.title}
      </h3>
      <div className="flex items-center gap-1 text-gray-400 text-xs mb-2">
        <MapPin className="w-3 h-3 flex-shrink-0" />
        <span>{post.location}</span>
      </div>
      <p className="text-gray-500 text-xs leading-relaxed mb-3 line-clamp-3">
        {post.description || "No description provided"}
      </p>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600 mb-4">
        <span className="flex items-center gap-1">
          <Phone className="w-3 h-3" />
          +94 {post.mobile}
        </span>
        <span className="flex items-center gap-1">
          <Mail className="w-3 h-3" />
          {post.email}
        </span>
      </div>
      <button
        onClick={() => onViewDetails(post)}
        className="relative overflow-hidden w-full bg-[#FF5A00] text-white font-bold text-xs py-2.5 rounded-lg transition-all duration-300 hover:bg-black hover:scale-105 group"
      >
        <span className="relative z-10">View Full Details</span>
        <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
      </button>
    </div>
  </div>
);

// ─── Review Card ──────────────────────────────────────────────────────────────

const ReviewCard = ({ 
  review, 
  currentUserId, 
  userRole, 
  onEdit, 
  onDelete 
}: { 
  review: any; 
  currentUserId?: string; 
  userRole?: string;
  onEdit?: (review: any) => void;
  onDelete?: (review: any) => void;
}) => {
  const name = review.reviewerName || review.reviewer || "Anonymous";
  // Normalize avatar field - check multiple possible field names
  const avatar = review.reviewerAvatar || review.avatar || review.photoURL || review.profilePicture || review.image || "";
  const text = review.comment || review.text || "";
  const time =
    review.createdAt instanceof Date
      ? review.createdAt.toLocaleDateString()
      : review.time || "";

  // Reaction state
  const [isReacting, setIsReacting] = useState(false);
  const [userHasReacted, setUserHasReacted] = useState(false);
  const [likeCount, setLikeCount] = useState(review.likes || 0);
  
  // Actions menu state
  const [showActions, setShowActions] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const isAuthenticated = !!currentUserId;

  // Permission checks
  const isReviewAuthor = isAuthenticated && review.reviewerId === currentUserId;
  const canEdit = isReviewAuthor && (userRole === "seeker" || userRole === "admin");
  const canDelete = isReviewAuthor || userRole === "service_provider" || userRole === "admin";
  const showActionsMenu = canEdit || canDelete;

  // Check if user has already reacted to this review
  useEffect(() => {
    if (!isAuthenticated || !review.id) return;

    let cancelled = false;

    const checkReaction = async () => {
      try {
        const hasReacted = await reviewService.hasUserReacted(review.id, currentUserId);
        if (!cancelled) setUserHasReacted(hasReacted);
      } catch (err) {
        console.error("Error checking reaction:", err);
      }
    };

    checkReaction();
    return () => { cancelled = true; };
  }, [review.id, currentUserId, isAuthenticated]);

  // Toggle reaction (like/unlike)
  const handleToggleReaction = async () => {
    if (!isAuthenticated || isReacting) return;

    // Optimistic update
    const optimisticReacted = !userHasReacted;
    const optimisticCount = optimisticReacted ? likeCount + 1 : likeCount - 1;
    setUserHasReacted(optimisticReacted);
    setLikeCount(Math.max(0, optimisticCount));

    setIsReacting(true);
    try {
      const result = await reviewService.toggleReaction(review.id, currentUserId);
      // Confirm with server truth
      setUserHasReacted(result.liked);
      setLikeCount(result.count);
    } catch (err) {
      // Roll back optimistic update on failure
      setUserHasReacted(!optimisticReacted);
      setLikeCount(likeCount);
      console.error("Error toggling reaction:", err);
    } finally {
      setIsReacting(false);
    }
  };

  const handleDelete = async (reason?: string) => {
    if (onDelete) {
      await onDelete({ ...review, deletionReason: reason });
    }
    setShowDeleteModal(false);
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(review);
    }
    setShowActions(false);
  };

  // State for handling image load errors
  const [imageError, setImageError] = useState(false);

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {avatar && !imageError ? (
              <img
                src={avatar}
                alt={name}
                className="w-11 h-11 rounded-full object-cover flex-shrink-0"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-[#0072D1]/10 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-[#0072D1]" />
              </div>
            )}
            <div>
              <p className="font-bold text-gray-900 text-sm">{name}</p>
              <p className="text-xs text-gray-400">{time}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {review.rating && (
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-3.5 h-3.5 ${
                      review.rating >= s
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-200"
                    }`}
                  />
                ))}
              </div>
            )}
            {/* Actions Menu (3 dots) */}
            {showActionsMenu && (
              <div className="relative">
                <button
                  onClick={() => setShowActions(!showActions)}
                  className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Review actions"
                >
                  <MoreVertical className="w-4 h-4 text-gray-400" />
                </button>

                {showActions && (
                  <>
                    {/* Click-away backdrop */}
                    <div
                      className="fixed inset-0 z-0"
                      onClick={() => setShowActions(false)}
                    />
                    <div className="absolute right-0 top-8 w-40 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-10">
                      {canEdit && (
                        <button
                          onClick={handleEdit}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Edit className="w-3 h-3" />
                          Edit Review
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => {
                            setShowDeleteModal(true);
                            setShowActions(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete Review
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed mb-5">{text}</p>
        <div className="flex items-center justify-end">
          {isAuthenticated ? (
            <button
              onClick={handleToggleReaction}
              disabled={isReacting}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 ${
                userHasReacted
                  ? "bg-red-50 text-red-600 hover:bg-red-100"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-red-500"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <Heart
                className={`w-4 h-4 transition-all duration-200 ${
                  userHasReacted ? "fill-red-600 scale-110" : ""
                }`}
              />
              <span className="text-sm font-bold">{likeCount}</span>
            </button>
          ) : (
            <span className="flex items-center gap-1.5 text-gray-600">
              <Heart className="w-4 h-4" />
              <span className="text-sm font-bold">{likeCount}</span>
            </span>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
          isLoading={false}
          reviewerName={name}
          userRole={userRole as "seeker" | "service_provider" | "admin"}
        />
      )}
    </>
  );
};

// ─── Add Review Modal ─────────────────────────────────────────────────────────

const AddReviewModal = ({
  isOpen,
  onClose,
  serviceProviderId,
  serviceProviderName,
  onReviewAdded,
}: {
  isOpen: boolean;
  onClose: () => void;
  serviceProviderId: string;
  serviceProviderName: string;
  onReviewAdded?: () => void;
}) => {
  const { currentUser, userProfile } = useAuth();
  const [name, setName] = useState(currentUser?.displayName || "");
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [userAvatar, setUserAvatar] = useState<string>("");
  const [avatarLoading, setAvatarLoading] = useState(true);

  // Helper function to extract avatar from user data (handles multiple field names)
  const extractAvatar = (data: any): string => {
    return data?.profilePicture || data?.photoURL || data?.avatar || data?.image || "";
  };

  // Fetch user's profile picture - runs whenever modal opens or user changes
  useEffect(() => {
    if (!isOpen || !currentUser) {
      setAvatarLoading(true);
      setUserAvatar("");
      return;
    }

    setAvatarLoading(true);

    // First try userProfile from AuthContext (check both photoURL and profilePicture)
    const avatarFromContext = extractAvatar(userProfile);
    if (avatarFromContext) {
      setUserAvatar(avatarFromContext);
      setAvatarLoading(false);
      return;
    }

    // Fetch from Firestore directly
    getDoc(doc(db, "users", currentUser.uid))
      .then((snap) => {
        if (snap.exists()) {
          const data = snap.data();
          const avatar = extractAvatar(data);
          setUserAvatar(avatar);
        } else {
          // Fallback to Firebase Auth photoURL
          setUserAvatar(currentUser.photoURL || "");
        }
      })
      .catch(() => {
        // Fallback to Firebase Auth photoURL
        setUserAvatar(currentUser.photoURL || "");
      })
      .finally(() => {
        setAvatarLoading(false);
      });

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, currentUser, userProfile]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", h);
      return () => window.removeEventListener("keydown", h);
    }
  }, [isOpen, onClose]);

  const handleSubmit = async () => {
    if (!name.trim() || !reviewText.trim() || !currentUser) return;
    setSubmitting(true);
    try {
      // If we already have an avatar from state, use it; otherwise fetch it fresh
      let finalAvatar = userAvatar || currentUser.photoURL || "";
      
      // If still no avatar, try to fetch directly from Firestore one more time
      if (!finalAvatar) {
        try {
          const userSnap = await getDoc(doc(db, "users", currentUser.uid));
          if (userSnap.exists()) {
            const userData = userSnap.data();
            finalAvatar = userData.profilePicture || userData.photoURL || userData.avatar || userData.image || "";
          }
        } catch (fetchErr) {
          console.warn("Failed to fetch user avatar during review submission:", fetchErr);
        }
      }

      await submitReview({
        serviceProviderId,
        reviewerId: currentUser.uid,
        reviewerName: name.trim(),
        reviewerAvatar: finalAvatar,
        comment: reviewText.trim(),
        rating,
      });
      onReviewAdded?.();
      onClose();
      setName(currentUser.displayName || "");
      setReviewText("");
      setRating(5);
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 md:p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full border-2 border-[#0072D1] flex items-center justify-center text-[#0072D1] hover:bg-[#0072D1] hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Add Review</h2>
          <p className="text-sm text-gray-500">for {serviceProviderName}</p>
        </div>

        <div className="mb-5">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Rating
          </label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className="focus:outline-none"
              >
                <Star
                  className={`w-7 h-7 transition-colors ${
                    rating >= star
                      ? "text-yellow-500 fill-yellow-500"
                      : "text-gray-300"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="mb-5">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Your Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="w-full border border-[#0072D1]/40 rounded-2xl px-4 py-3 text-sm text-gray-700 outline-none focus:border-[#0072D1] focus:ring-2 focus:ring-[#0072D1]/15 transition-colors bg-gray-50"
          />
        </div>

        <div className="mb-7">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Your Review
          </label>
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            rows={4}
            placeholder="Share your experience with this service provider…"
            className="w-full border border-[#0072D1]/40 rounded-2xl px-4 py-3 text-sm text-gray-700 outline-none focus:border-[#0072D1] focus:ring-2 focus:ring-[#0072D1]/15 transition-colors bg-gray-50 resize-none"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting || !name.trim() || !reviewText.trim()}
          className="relative overflow-hidden w-full bg-[#0072D1] text-white font-bold py-3.5 rounded-2xl text-sm transition-all duration-300 hover:bg-black hover:scale-[1.01] group shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="relative z-10">
            {submitting ? "Submitting…" : "Submit Review"}
          </span>
          <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 rounded-2xl" />
        </button>
      </div>
    </div>
  );
};

// ─── Booking Modal ─────────────────────────────────────────────────────────────

const BookingModal = ({
  isOpen,
  onClose,
  customerName,
  setCustomerName,
  address,
  setAddress,
  homeLocation,
  setHomeLocation,
  contact,
  setContact,
  dateTime,
  setDateTime,
  onSubmit,
  submitting,
}: {
  isOpen: boolean;
  onClose: () => void;
  customerName: string;
  setCustomerName: (value: string) => void;
  address: string;
  setAddress: (value: string) => void;
  homeLocation: string;
  setHomeLocation: (value: string) => void;
  contact: string;
  setContact: (value: string) => void;
  dateTime: string;
  setDateTime: (value: string) => void;
  onSubmit: () => void;
  submitting: boolean;
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 md:p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full border-2 border-[#0072D1] flex items-center justify-center text-[#0072D1] hover:bg-[#0072D1] hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Book {customerName ? customerName : "Provider"}</h2>
          <p className="text-sm text-gray-500">Please fill booking details</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Your Name</label>
            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full border border-[#0072D1]/40 rounded-2xl px-4 py-2 text-sm bg-gray-50 focus:outline-none focus:border-[#0072D1]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Contact</label>
            <input
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="w-full border border-[#0072D1]/40 rounded-2xl px-4 py-2 text-sm bg-gray-50 focus:outline-none focus:border-[#0072D1]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Address</label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full border border-[#0072D1]/40 rounded-2xl px-4 py-2 text-sm bg-gray-50 focus:outline-none focus:border-[#0072D1]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Home Location</label>
            <input
              value={homeLocation}
              onChange={(e) => setHomeLocation(e.target.value)}
              className="w-full border border-[#0072D1]/40 rounded-2xl px-4 py-2 text-sm bg-gray-50 focus:outline-none focus:border-[#0072D1]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Date & Time</label>
            <input
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              className="w-full border border-[#0072D1]/40 rounded-2xl px-4 py-2 text-sm bg-gray-50 focus:outline-none focus:border-[#0072D1]"
            />
          </div>

          <button
            onClick={onSubmit}
            disabled={submitting}
            className="w-full text-white bg-[#0072D1] px-4 py-2.5 rounded-2xl font-bold hover:bg-[#005baa] transition-colors disabled:opacity-50"
          >
            {submitting ? "Booking..." : "Confirm Booking"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Pagination ───────────────────────────────────────────────────────────────

const Pagination = ({
  current,
  total,
  onChange,
}: {
  current: number;
  total: number;
  onChange: (p: number) => void;
}) => (
  <div className="flex items-center justify-center gap-2 mt-8">
    <button
      onClick={() => onChange(Math.max(1, current - 1))}
      disabled={current === 1}
      className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#FF5A00] hover:text-[#FF5A00] disabled:opacity-30 transition-colors"
    >
      ‹
    </button>
    {Array.from({ length: total }, (_, i) => i + 1).map((p) => (
      <button
        key={p}
        onClick={() => onChange(p)}
        className={`w-8 h-8 rounded-full text-sm font-bold transition-all duration-200 ${
          p === current
            ? "bg-[#FF5A00] text-white shadow-md"
            : "border border-gray-200 text-gray-600 hover:border-[#FF5A00] hover:text-[#FF5A00]"
        }`}
      >
        {p}
      </button>
    ))}
    <button
      onClick={() => onChange(Math.min(total, current + 1))}
      disabled={current === total}
      className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#FF5A00] hover:text-[#FF5A00] disabled:opacity-30 transition-colors"
    >
      ›
    </button>
  </div>
);

// ─── About Panel ──────────────────────────────────────────────────────────────

const AboutPanel = ({ providerData }: { providerData: any }) => (
  <div className="space-y-4">
    {providerData?.bio && (
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-900 text-sm">About</h3>
          <User className="w-5 h-5 text-gray-400" />
        </div>
        <p className="text-xs text-gray-600 leading-relaxed">{providerData.bio}</p>
      </div>
    )}
    {(providerData?.phoneNumber || providerData?.phone) && (
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-900 text-sm">Phone</h3>
          <Phone className="w-5 h-5 text-gray-400" />
        </div>
        <p className="text-xs text-gray-600">
          {providerData.phoneNumber || providerData.phone}
        </p>
      </div>
    )}
    {providerData?.email && (
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-900 text-sm">Email</h3>
          <Mail className="w-5 h-5 text-gray-400" />
        </div>
        <p className="text-xs text-gray-600 break-all">{providerData.email}</p>
      </div>
    )}
    {providerData?.address && (
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-900 text-sm">Location</h3>
          <MapPin className="w-5 h-5 text-gray-400" />
        </div>
        <p className="text-xs text-gray-600 leading-relaxed">
          {typeof providerData.address === "string"
            ? providerData.address
            : [
                providerData.address.street,
                providerData.address.city,
                providerData.address.country,
              ]
                .filter(Boolean)
                .join(", ")}
        </p>
      </div>
    )}
    {providerData?.availableServices &&
      providerData.availableServices.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-900 text-sm">Services Offered</h3>
            <List className="w-5 h-5 text-gray-400" />
          </div>
          <div className="flex flex-wrap gap-2">
            {providerData.availableServices.map((service: string, i: number) => (
              <span
                key={i}
                className="px-2 py-1 bg-[#0072D1]/10 text-[#0072D1] text-xs rounded-full"
              >
                {service}
              </span>
            ))}
          </div>
        </div>
      )}
  </div>
);

// ─── Rating Summary ───────────────────────────────────────────────────────────

const RatingSummary = ({
  averageRating,
  reviews,
  onAddReview,
}: {
  averageRating: number;
  reviews: any[];
  onAddReview: () => void;
}) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
          <span className="text-lg font-bold text-gray-900">
            {averageRating.toFixed(1)}
          </span>
        </div>
        <span className="text-sm text-gray-600">
          ({reviews.length} review{reviews.length !== 1 ? "s" : ""})
        </span>
      </div>
      <button
        onClick={onAddReview}
        className="relative overflow-hidden flex items-center gap-1.5 bg-black text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all duration-300 hover:bg-[#0072D1] hover:scale-105 group"
      >
        <Star className="w-3.5 h-3.5 relative z-10" />
        <span className="relative z-10">Add Review</span>
        <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
      </button>
    </div>
    <div className="flex items-center gap-4 text-xs text-gray-600 flex-wrap">
      {[5, 4, 3, 2, 1].map((star) => {
        const count = reviews.filter((r) => r.rating === star).length;
        return (
          <div key={star} className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
              <span>{star}</span>
            </span>
            <div className="w-16 bg-gray-200 rounded-full h-2">
              <div
                className="bg-yellow-400 h-2 rounded-full"
                style={{
                  width: `${(count / Math.max(reviews.length, 1)) * 100}%`,
                }}
              />
            </div>
            <span>{count}</span>
          </div>
        );
      })}
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const PublicProfile: React.FC = () => {
  const { serviceProviderId } = useParams<{ serviceProviderId: string }>();
  const { currentUser, userRole, userProfile } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState<ProfileTab>("posts");
  const [page, setPage] = useState(1);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingCustomerName, setBookingCustomerName] = useState("");
  const [bookingAddress, setBookingAddress] = useState("");
  const [bookingHomeLocation, setBookingHomeLocation] = useState("");
  const [bookingContact, setBookingContact] = useState("");
  const [bookingDateTime, setBookingDateTime] = useState("");
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);

  const [coverSrc, setCoverSrc] = useState<string>(COVER_IMG);
  const [profileImageSrc, setProfileImageSrc] = useState<string>("");

  // ── Provider ──────────────────────────────────────────────────────────────
  const [providerData, setProviderData] = useState<any>(null);
  const [loadingProvider, setLoadingProvider] = useState(true);
  const [providerError, setProviderError] = useState<string | null>(null);

  // ── Posts ─────────────────────────────────────────────────────────────────
  const [providerPosts, setProviderPosts] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [postsError, setPostsError] = useState<string | null>(null);

  // ── Reviews ───────────────────────────────────────────────────────────────
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [averageRating, setAverageRating] = useState(0);

  // ── Edit Review Modal ─────────────────────────────────────────────────────
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingReview, setEditingReview] = useState<any>(null);
  const [editText, setEditText] = useState("");
  const [editRating, setEditRating] = useState(5);
  const [editSubmitting, setEditSubmitting] = useState(false);

  // ── Fetch provider profile ─────────────────────────────────────────────────

  useEffect(() => {
    if (!serviceProviderId) return;

    setLoadingProvider(true);
    setProviderError(null);
    setProviderData(null);

    // Use retry mechanism for more robust fetching
    withRetry(() => fetchUserDoc(serviceProviderId))
      .then((data) => {
        if (!data) {
          setProviderError("Service provider not found.");
          return;
        }

        setProviderData(data);

        // FIX: use normalized `profilePicture` field with fallback to `photoURL`
        if (data.profilePicture) {
          setProfileImageSrc(data.profilePicture);
        } else if (data.photoURL) {
          setProfileImageSrc(data.photoURL);
        }

        // Optional cover image
        if (data.coverImage) {
          setCoverSrc(data.coverImage);
        }
      })
      .catch((err) => {
        console.error("[PublicProfile] Provider fetch error after retries:", err);
        setProviderError("Failed to load provider profile. Please try again.");
      })
      .finally(() => setLoadingProvider(false));
  }, [serviceProviderId]);

  // ── Fetch posts ────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!serviceProviderId) return;

    setLoadingPosts(true);
    setPostsError(null);

    // FIX: use renamed function that filters approved client-side (no composite index needed)
    fetchProviderPosts(serviceProviderId)
      .then(setProviderPosts)
      .catch((err) => {
        console.error("[PublicProfile] Posts fetch error:", err);
        setPostsError("Failed to load posts. Please try again.");
      })
      .finally(() => setLoadingPosts(false));
  }, [serviceProviderId]);

  // ── Fetch reviews ──────────────────────────────────────────────────────────

  const loadReviews = () => {
    if (!serviceProviderId) return;
    setLoadingReviews(true);

    fetchReviews(serviceProviderId)
      .then((data) => {
        setReviews(data);
        const avg =
          data.length
            ? data.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) /
              data.length
            : 0;
        setAverageRating(avg);
      })
      .catch((err) => console.error("[PublicProfile] Reviews fetch error:", err))
      .finally(() => setLoadingReviews(false));
  };

  const resetBookingForm = () => {
    setBookingCustomerName("");
    setBookingAddress("");
    setBookingHomeLocation("");
    setBookingContact("");
    setBookingDateTime("");
  };

  const handleSubmitBooking = async () => {
    if (!serviceProviderId || !currentUser) return;
    if (!bookingCustomerName.trim() || !bookingAddress.trim() || !bookingHomeLocation.trim() || !bookingContact.trim() || !bookingDateTime.trim()) {
      alert("Please fill all booking fields.");
      return;
    }

    const bookingTime = new Date(bookingDateTime);
    if (isNaN(bookingTime.getTime())) {
      alert("Please select a valid booking date and time.");
      return;
    }

    setBookingSubmitting(true);

    try {
      const createdByRole = userRole === "admin" ? "admin" : "seeker";
      const bookingId = await bookingService.createBooking({
        customerId: currentUser.uid,
        providerId: serviceProviderId,
        customerName: bookingCustomerName,
        customerContact: bookingContact,
        address: bookingAddress,
        homeLocation: bookingHomeLocation,
        bookingDate: bookingTime,
        createdByRole,
      });

      await notificationService.createBookingRequestNotification(
        serviceProviderId,
        bookingId,
        bookingCustomerName,
        bookingTime
      );
      alert("Booking request sent successfully.");
      setShowBookingModal(false);
      resetBookingForm();
    } catch (err: any) {
      console.error("Error creating booking", err);
      const errorMsg = err?.message || "Unknown error";
      alert(`Failed to create booking: ${errorMsg}`);
    } finally {
      setBookingSubmitting(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [serviceProviderId]);

  // ── Derived values ─────────────────────────────────────────────────────────

  // FIX: don't fall back to "Service Provider" string when data is loading or
  // errored — show nothing so the error message is the only signal shown.
  const providerName = providerData
    ? [
        providerData.displayName || providerData.firstName || "",
        providerData.lastName || "",
      ]
        .filter(Boolean)
        .join(" ") || "Unnamed Provider"
    : "";

  const primaryService = providerData?.availableServices?.[0] || "";

  const TABS: { key: ProfileTab; label: string }[] = [
    { key: "posts", label: "Posts" },
    { key: "reviews", label: "Reviews" },
  ];

  // Paginate posts (6 per page)
  const POSTS_PER_PAGE = 6;
  const pagedPosts = providerPosts.slice(
    (page - 1) * POSTS_PER_PAGE,
    page * POSTS_PER_PAGE
  );
  const totalPages = Math.max(1, Math.ceil(providerPosts.length / POSTS_PER_PAGE));

  // ── Sub-components ─────────────────────────────────────────────────────────

  const BackBtn = () => (
    <button
      onClick={() => navigate("/browseplace")}
      className="relative overflow-hidden flex items-center gap-1.5 bg-[#0072D1] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all duration-300 hover:bg-black hover:scale-105 group"
    >
      <ChevronLeft className="w-3.5 h-3.5 relative z-10" />
      <span className="relative z-10">Back to Browse</span>
      <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
    </button>
  );

  const AddReviewBtn = ({ small = false }: { small?: boolean }) => (
    <button
      onClick={() => setShowReviewModal(true)}
      className={`relative overflow-hidden flex items-center gap-1.5 bg-black text-white font-bold rounded-xl transition-all duration-300 hover:bg-[#0072D1] hover:scale-105 group ${
        small ? "text-xs px-3 py-2" : "text-xs px-4 py-2.5"
      }`}
    >
      <Star className="w-3.5 h-3.5 relative z-10" />
      <span className="relative z-10">Add Review</span>
      <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
    </button>
  );

  const PostsContent = () => (
    <>
      {loadingPosts ? (
        <div className="flex justify-center py-12">
          <Loader className="w-6 h-6 text-[#0072D1] animate-spin" />
        </div>
      ) : postsError ? (
        <div className="text-center py-12">
          <p className="text-red-500 text-sm font-bold">{postsError}</p>
          <button
            onClick={() => {
              setPostsError(null);
              setLoadingPosts(true);
              fetchProviderPosts(serviceProviderId!)
                .then(setProviderPosts)
                .catch(() => setPostsError("Failed to load posts. Please try again."))
                .finally(() => setLoadingPosts(false));
            }}
            className="mt-3 text-xs text-[#0072D1] underline"
          >
            Retry
          </button>
        </div>
      ) : providerPosts.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="font-bold text-gray-600 mb-1">No posts yet</p>
          <p className="text-sm">
            This service provider has no approved listings.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {pagedPosts.map((p) => (
              <PostCard key={p.id} post={p} onViewDetails={setSelectedPost} />
            ))}
          </div>
          <Pagination current={page} total={totalPages} onChange={setPage} />
        </>
      )}
    </>
  );

  // ── Handle Edit Review ────────────────────────────────────────────────────
  const handleEditReview = (review: any) => {
    setEditingReview(review);
    setEditText(review.comment || "");
    setEditRating(review.rating || 5);
    setShowEditModal(true);
  };

  // ── Handle Delete Review ──────────────────────────────────────────────────
  const handleDeleteReview = async (reviewWithReason: any) => {
    try {
      await reviewService.deleteReview(
        reviewWithReason.id,
        currentUser!.uid,
        userRole as "seeker" | "service_provider" | "admin"
      );
      // Remove from local state
      setReviews(prev => prev.filter(r => r.id !== reviewWithReason.id));
      // Recalculate average
      const updatedReviews = reviews.filter(r => r.id !== reviewWithReason.id);
      const avg = updatedReviews.length
        ? updatedReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / updatedReviews.length
        : 0;
      setAverageRating(avg);
    } catch (err: any) {
      console.error("Error deleting review:", err);
      alert(err.message || "Failed to delete review.");
    }
  };

  // ── Handle Submit Edit ────────────────────────────────────────────────────
  const handleSubmitEdit = async () => {
    if (!editText.trim() || !editingReview) return;
    setEditSubmitting(true);
    try {
      await reviewService.updateReview(
        editingReview.id,
        currentUser!.uid,
        userRole as "seeker" | "service_provider" | "admin",
        { comment: editText.trim(), rating: editRating }
      );
      // Update local state
      setReviews(prev => prev.map(r => 
        r.id === editingReview.id 
          ? { ...r, comment: editText.trim(), rating: editRating }
          : r
      ));
      // Recalculate average
      const avg = reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length;
      setAverageRating(avg);
      setShowEditModal(false);
      setEditingReview(null);
      setEditText("");
      setEditRating(5);
    } catch (err: any) {
      console.error("Error updating review:", err);
      alert(err.message || "Failed to update review.");
    } finally {
      setEditSubmitting(false);
    }
  };

  const ReviewsContent = () => (
    <ReviewsList
      serviceProviderId={serviceProviderId || ""}
      serviceProviderName={providerName}
      onReviewAdded={loadReviews}
    />
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Cover + Avatar */}
      <div className="relative w-full">
        <div className="w-full h-36 md:h-52 overflow-hidden">
          <img
            src={coverSrc}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute left-6 md:left-8 -bottom-12 md:-bottom-16">
          <div className="w-24 h-24 md:w-36 md:h-36 rounded-[22px] md:rounded-[28px] border-4 border-[#0072D1] bg-white shadow-xl overflow-hidden">
            {profileImageSrc ? (
              <img
                src={profileImageSrc}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <User className="w-10 h-10 text-gray-400" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── DESKTOP layout ── */}
      <div className="hidden md:flex gap-6 max-w-7xl mx-auto px-6 mt-20 pb-12">
        {/* LEFT sidebar */}
        <aside className="w-64 flex-shrink-0">
          <div className="text-center mb-5">
            {loadingProvider ? (
              <div className="flex justify-center h-16 items-center">
                <Loader className="w-6 h-6 text-[#0072D1] animate-spin" />
              </div>
            ) : providerError ? (
              <p className="text-red-500 text-sm font-semibold">{providerError}</p>
            ) : (
              <>
                <h2 className="text-xl font-black text-gray-900">
                  {providerName}
                </h2>
                {primaryService && (
                  <p className="text-base font-bold text-gray-600 mt-1">
                    {primaryService}
                  </p>
                )}
              </>
            )}
          </div>
          <AboutPanel providerData={providerData} />
        </aside>

        {/* RIGHT content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between border-b border-gray-200 mb-6">
            <div className="flex">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => {
                    setTab(t.key);
                    setPage(1);
                  }}
                  className={`px-5 py-3 text-sm font-bold border-b-2 transition-all ${
                    tab === t.key
                      ? "text-gray-900 border-gray-900"
                      : "text-gray-500 border-transparent hover:text-gray-700"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 pb-1">
              <BackBtn />
              <MessageButton
                serviceProviderId={serviceProviderId || ''}
                serviceProviderName={providerName}
              />
              {userRole !== "service_provider" && (
                <button
                  onClick={() => setShowBookingModal(true)}
                  className="relative overflow-hidden flex items-center gap-1.5 bg-green-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all duration-300 hover:bg-green-700 hover:scale-105 group"
                >
                  <span className="relative z-10">Book Now</span>
                  <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </button>
              )}
              <AddReviewBtn />
            </div>
          </div>

          {tab === "posts" && <PostsContent />}
          {tab === "reviews" && <ReviewsContent />}
        </div>
      </div>

      {/* ── MOBILE layout ── */}
      <div className="md:hidden">
        <div className="flex flex-col items-center pt-14 pb-3 px-4">
          {loadingProvider ? (
            <div className="flex justify-center h-12 items-center">
              <Loader className="w-5 h-5 text-[#0072D1] animate-spin" />
            </div>
          ) : providerError ? (
            <p className="text-red-500 text-sm font-semibold">{providerError}</p>
          ) : (
            <>
              <h2 className="text-base font-black text-gray-900 text-center">
                {providerName}
                {primaryService && (
                  <span className="font-normal text-gray-600">
                    {" "}
                    · {primaryService}
                  </span>
                )}
              </h2>
              <div className="flex gap-2 mt-2">
                <BackBtn />
                <MessageButton
                  serviceProviderId={serviceProviderId || ''}
                  serviceProviderName={providerName}
                  size="sm"
                />
                {userRole !== "service_provider" && (
                  <button
                    onClick={() => setShowBookingModal(true)}
                    className="text-xs px-3 py-2 rounded-lg bg-green-600 text-white font-bold hover:bg-green-700 transition-colors"
                  >
                    Book Now
                  </button>
                )}
                <AddReviewBtn small />
              </div>
            </>
          )}
        </div>

        <div className="flex border-b border-gray-200">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => {
                setTab(t.key);
                setPage(1);
              }}
              className={`flex-1 py-3 text-xs font-bold border-b-2 transition-all ${
                tab === t.key
                  ? "text-[#0072D1] border-[#0072D1]"
                  : "text-gray-400 border-transparent"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="px-4 pt-4 pb-12 space-y-4">
          {tab === "posts" && <PostsContent />}
          {tab === "reviews" && <ReviewsContent />}
        </div>
      </div>

      {/* Full Details Modal */}
      {selectedPost && (
        <FullDetailsModal
          card={selectedPost}
          onClose={() => setSelectedPost(null)}
        />
      )}

      {/* Add Review Modal */}
      {showReviewModal && serviceProviderId && (
        <AddReviewModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          serviceProviderId={serviceProviderId}
          serviceProviderName={providerName}
          onReviewAdded={loadReviews}
        />
      )}

      {/* Edit Review Modal */}
      {showEditModal && editingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => {
              setShowEditModal(false);
              setEditingReview(null);
              setEditText("");
              setEditRating(5);
            }}
          />
          <div className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 md:p-8">
            <button
              onClick={() => {
                setShowEditModal(false);
                setEditingReview(null);
                setEditText("");
                setEditRating(5);
              }}
              className="absolute top-4 right-4 w-9 h-9 rounded-full border-2 border-[#0072D1] flex items-center justify-center text-[#0072D1] hover:bg-[#0072D1] hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-1">Edit Review</h2>
              <p className="text-sm text-gray-500">Update your review</p>
            </div>

            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Rating
              </label>
              <div className="flex gap-1 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setEditRating(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-7 h-7 transition-colors ${
                        editRating >= star
                          ? "text-yellow-500 fill-yellow-500"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-7">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Your Review
              </label>
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={4}
                placeholder="Share your experience with this service provider…"
                className="w-full border border-[#0072D1]/40 rounded-2xl px-4 py-3 text-sm text-gray-700 outline-none focus:border-[#0072D1] focus:ring-2 focus:ring-[#0072D1]/15 transition-colors bg-gray-50 resize-none"
              />
            </div>

            <button
              onClick={handleSubmitEdit}
              disabled={editSubmitting || !editText.trim()}
              className="relative overflow-hidden w-full bg-[#0072D1] text-white font-bold py-3.5 rounded-2xl text-sm transition-all duration-300 hover:bg-black hover:scale-[1.01] group shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="relative z-10">
                {editSubmitting ? "Updating…" : "Update Review"}
              </span>
              <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 rounded-2xl" />
            </button>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && serviceProviderId && (
        <BookingModal
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          customerName={bookingCustomerName}
          setCustomerName={setBookingCustomerName}
          address={bookingAddress}
          setAddress={setBookingAddress}
          homeLocation={bookingHomeLocation}
          setHomeLocation={setBookingHomeLocation}
          contact={bookingContact}
          setContact={setBookingContact}
          dateTime={bookingDateTime}
          setDateTime={setBookingDateTime}
          onSubmit={handleSubmitBooking}
          submitting={bookingSubmitting}
        />
      )}
    </div>
  );
};

export default PublicProfile;