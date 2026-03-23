import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { reviewService } from "../services/reviewService";
import { postService } from "../services/postService";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import {
  MapPin,
  Phone,
  Mail,
  Heart,
  CornerDownLeft,
  
  User,
  X,
  List,
  Star,
  ChevronLeft
} from "lucide-react";
import ReviewModal from "../Components/ReviewModal";
import ReviewsList from "../Components/ReviewsList";

// ─── Types ────────────────────────────────────────────────────────────────────

type ProfileTab = "posts" | "reviews";

// ─── Cover Image ──────────────────────────────────────────────────────────────

const COVER_IMG =
  "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&q=80";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Safely convert a Firestore Timestamp or any date-like value to a JS Date */
function toDate(value: any): Date {
  if (!value) return new Date();
  if (typeof value?.toDate === "function") return value.toDate();
  if (value instanceof Date) return value;
  return new Date(value);
}

// ─── Full Details Modal ───────────────────────────────────────────────────────

const FullDetailsModal = ({
  card,
  onClose
}: {
  card: any;
  onClose: () => void;
}) => {
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const details = [
    { label: "Included Services Checklist",              value: Array.isArray(card.checklist) ? card.checklist.join(", ") : (card.includedServices || "Not specified") },
    { label: "Requirement of Client Provided Materials", value: card.clientMaterials || "Not specified" },
    { label: "Pricing Model",                            value: card.pricingModel || "Not specified" },
    { label: "Starting Price",                           value: card.startingPrice ? `LKR ${Number(card.startingPrice).toLocaleString()}` : "Not specified" },
    { label: "Inspection Fee",                           value: card.inspectionFee ? `LKR ${Number(card.inspectionFee).toLocaleString()}` : "Not specified" },
    { label: "Specific Cities",                          value: card.specificCities || "Not specified" },
    { label: "Maximum Travel Distance",                  value: card.travelDistance || "Not specified" },
    { label: "Available Days",                           value: Array.isArray(card.availableDays) ? card.availableDays.join(", ") : (card.availableDays || "Not specified") },
    { label: "Available Hours",                          value: card.timeFromHour ? `${card.timeFromHour}:00 ${card.timeFromAmPm} – ${card.timeToHour}:00 ${card.timeToAmPm}` : (card.availableHours || "Not specified") },
    { label: "Emergency Availability",                   value: card.emergency || "Not specified" }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
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
            {/* LEFT: Images */}
            <div className="w-full md:w-[52%] flex-shrink-0">
              <div className="relative rounded-2xl overflow-hidden bg-gray-100">
                {card.images && card.images.length > 0 ? (
                  <>
                    <img src={card.images[activeImg]} alt={card.title} className="w-full h-56 md:h-[360px] object-cover" />
                    {card.images.length > 1 && (
                      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
                        {card.images.map((_: any, i: number) => (
                          <button
                            key={i}
                            onClick={() => setActiveImg(i)}
                            className={`rounded-full transition-all duration-200 ${i === activeImg ? "bg-[#0072D1] w-5 h-2.5" : "bg-gray-400/70 w-2.5 h-2.5 hover:bg-gray-600"}`}
                          />
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-56 md:h-[360px] flex items-center justify-center">
                    <span className="text-sm text-gray-400">No images uploaded</span>
                  </div>
                )}
              </div>
              <div className="mt-5">
                <div className="flex items-center gap-2 mb-2">
                  <List className="w-4 h-4 text-gray-600" />
                  <h3 className="font-black text-gray-800 text-base">Details</h3>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{card.description}</p>
              </div>
            </div>

            {/* RIGHT: Info */}
            <div className="flex-1 min-w-0">
              <div className="space-y-3">
                {details.map(({ label, value }) => (
                  <div key={label} className="flex flex-col gap-0.5">
                    <p className="text-sm text-gray-900 leading-snug">
                      <span className="font-black">{label}: </span>
                      <span className="font-normal text-gray-700">{value}</span>
                    </p>
                  </div>
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

// ─── Post Card (Read-Only — no edit/delete controls) ──────────────────────────

const PostCard = ({
  post,
  onViewDetails
}: {
  post: any;
  onViewDetails: (post: any) => void;
}) => (
  <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="relative">
      {post.images && post.images.length > 0 ? (
        <img src={post.images[0]} alt={post.title} className="w-full h-44 object-cover" />
      ) : (
        <div className="w-full h-44 bg-gray-100 flex items-center justify-center">
          <span className="text-sm text-gray-400">No image</span>
        </div>
      )}
      {/* Read-only status badge — approved posts only, but still show badge */}
      <span className="absolute top-3 left-3 text-xs font-bold px-3 py-1 rounded-full shadow-sm bg-green-100 text-green-800">
        Available
      </span>
    </div>

    <div className="p-4 border-x border-b border-[#FF5A00]/30 rounded-b-2xl">
      <h3 className="font-black text-gray-900 text-base leading-snug mb-1">{post.title}</h3>
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

const ReviewCard = ({ review }: { review: any }) => {
  // Firestore reviews use reviewerName; fall back to reviewer for compatibility
  const name = review.reviewerName || review.reviewer || "Anonymous";
  const avatar = review.reviewerAvatar || review.avatar || "";
  const text = review.comment || review.text || "";
  const time = review.createdAt
    ? toDate(review.createdAt).toLocaleDateString()
    : review.time || "";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {avatar ? (
            <img src={avatar} alt={name} className="w-11 h-11 rounded-full object-cover flex-shrink-0" />
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
        {/* Star rating */}
        {review.rating && (
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className={`w-3.5 h-3.5 ${review.rating >= s ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`} />
            ))}
          </div>
        )}
      </div>
      <p className="text-sm text-gray-700 leading-relaxed mb-5">{text}</p>
      <div className="flex items-center justify-between">
        <button className="flex items-center gap-1.5 text-gray-600 hover:text-red-500 transition-colors">
          <Heart className="w-4 h-4" />
          <span className="text-sm font-bold">{review.likes || 0}</span>
        </button>
        <button className="flex items-center gap-1.5 text-gray-600 hover:text-[#0072D1] font-bold text-sm transition-colors">
          Reply <CornerDownLeft className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

// ─── Add Review Modal ─────────────────────────────────────────────────────────

const AddReviewModal = ({
  isOpen,
  onClose,
  serviceProviderId,
  serviceProviderName,
  onReviewAdded
}: {
  isOpen: boolean;
  onClose: () => void;
  serviceProviderId: string;
  serviceProviderName: string;
  onReviewAdded?: () => void;
}) => {
  const { currentUser } = useAuth();
  const [name, setName] = React.useState(currentUser?.displayName || "");
  const [reviewText, setReviewText] = React.useState("");
  const [rating, setRating] = React.useState(5);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [isOpen]);

  React.useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (isOpen) {
      window.addEventListener("keydown", h);
      return () => window.removeEventListener("keydown", h);
    }
  }, [isOpen, onClose]);

  const handleSubmit = async () => {
    if (!name.trim() || !reviewText.trim() || !currentUser) return;
    setSubmitting(true);
    try {
      await reviewService.createReview({
        serviceProviderId: serviceProviderId,
        reviewerId: currentUser.uid,
        reviewerName: name,
        comment: reviewText,
        rating: rating,
        reviewerAvatar: currentUser.photoURL || ""
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
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 md:p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full border-2 border-[#0072D1]
            flex items-center justify-center text-[#0072D1] hover:bg-[#0072D1] hover:text-white transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
          </svg>
        </button>

        <div className="text-center mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Add Review</h2>
          <p className="text-sm text-gray-500">for {serviceProviderName}</p>
        </div>

        {/* Star rating picker */}
        <div className="mb-5">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Rating</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button key={star} onClick={() => setRating(star)} className="focus:outline-none">
                <Star className={`w-7 h-7 transition-colors ${rating >= star ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Name */}
        <div className="mb-5">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Your Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="w-full border border-[#0072D1]/40 rounded-2xl px-4 py-3 text-sm text-gray-700
              outline-none focus:border-[#0072D1] focus:ring-2 focus:ring-[#0072D1]/15 transition-colors bg-gray-50"
          />
        </div>

        {/* Review text */}
        <div className="mb-7">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Your Review</label>
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            rows={4}
            placeholder="Share your experience with this service provider…"
            className="w-full border border-[#0072D1]/40 rounded-2xl px-4 py-3 text-sm text-gray-700
              outline-none focus:border-[#0072D1] focus:ring-2 focus:ring-[#0072D1]/15 transition-colors bg-gray-50 resize-none"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting || !name.trim() || !reviewText.trim()}
          className="relative overflow-hidden w-full bg-[#0072D1] text-white font-bold
            py-3.5 rounded-2xl text-sm transition-all duration-300 hover:bg-black
            hover:scale-[1.01] group shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="relative z-10">{submitting ? "Submitting…" : "Submit Review"}</span>
          <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 rounded-2xl" />
        </button>
      </div>
    </div>
  );
};

// ─── Pagination ───────────────────────────────────────────────────────────────

const Pagination = ({
  current,
  total,
  onChange
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

// ─── About Panel (Read-Only) ──────────────────────────────────────────────────

const AboutPanel = ({
  providerData
}: {
  providerData: any;
}) => (
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
        <p className="text-xs text-gray-600 leading-relaxed">
          {providerData.phoneNumber || providerData.phone}
        </p>
      </div>
    )}
    {(providerData?.email) && (
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-900 text-sm">Email</h3>
          <Mail className="w-5 h-5 text-gray-400" />
        </div>
        <p className="text-xs text-gray-600 leading-relaxed break-all">
          {providerData.email}
        </p>
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
            : `${providerData.address.street || ""}, ${providerData.address.city || ""}, ${providerData.address.country || ""}`}
        </p>
      </div>
    )}
    {providerData?.availableServices && providerData.availableServices.length > 0 && (
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-900 text-sm">Services Offered</h3>
          <List className="w-5 h-5 text-gray-400" />
        </div>
        <div className="flex flex-wrap gap-2">
          {providerData.availableServices.map((service: string, index: number) => (
            <span key={index} className="px-2 py-1 bg-[#0072D1]/10 text-[#0072D1] text-xs rounded-full">
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
  onAddReview
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
          <span className="text-lg font-bold text-gray-900">{averageRating.toFixed(1)}</span>
        </div>
        <span className="text-sm text-gray-600">({reviews.length} review{reviews.length !== 1 ? "s" : ""})</span>
      </div>
      <button
        onClick={onAddReview}
        className="relative overflow-hidden flex items-center gap-1.5 bg-black text-white text-xs
        font-bold px-4 py-2.5 rounded-xl transition-all duration-300 hover:bg-[#0072D1] hover:scale-105 group"
      >
        <Star className="w-3.5 h-3.5 relative z-10" />
        <span className="relative z-10">Add Review</span>
        <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
      </button>
    </div>
    <div className="flex items-center gap-4 text-xs text-gray-600 flex-wrap">
      {[5, 4, 3, 2, 1].map((star) => (
        <div key={star} className="flex items-center gap-2">
          <span className="flex items-center gap-1">
            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
            <span>{star}</span>
          </span>
          <div className="w-16 bg-gray-200 rounded-full h-2">
            <div
              className="bg-yellow-400 h-2 rounded-full"
              style={{ width: `${(reviews.filter(r => r.rating === star).length / Math.max(reviews.length, 1)) * 100}%` }}
            />
          </div>
          <span>{reviews.filter(r => r.rating === star).length}</span>
        </div>
      ))}
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const PublicProfile: React.FC = () => {
  const { serviceProviderId } = useParams<{ serviceProviderId: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState<ProfileTab>("posts");
  const [page, setPage] = useState(1);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);

  const [coverSrc, setCoverSrc] = useState<string>(COVER_IMG);
  const [profileImageSrc, setProfileImageSrc] = useState<string>("");

  const [providerData, setProviderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [providerPosts, setProviderPosts] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [averageRating, setAverageRating] = useState<number>(0);

  // ── Fetch provider profile ─────────────────────────────────────────────────

  useEffect(() => {
    const fetchProviderData = async () => {
      if (!serviceProviderId) return;
      try {
        setLoading(true);
        const userDoc = await getDoc(doc(db, "users", serviceProviderId));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setProviderData(data);
          if (data.coverImage) setCoverSrc(data.coverImage);
          if (data.photoURL)   setProfileImageSrc(data.photoURL);
        } else {
          setError("Service provider not found.");
        }
      } catch (err) {
        console.error("Error fetching provider data:", err);
        setError("Failed to load provider data.");
      } finally {
        setLoading(false);
      }
    };
    fetchProviderData();
  }, [serviceProviderId]);

  // ── Fetch approved posts only ──────────────────────────────────────────────

  useEffect(() => {
    const fetchProviderPosts = async () => {
      if (!serviceProviderId) return;
      try {
        setLoadingPosts(true);
        const allPosts = await postService.getPostsByServiceProvider(serviceProviderId);
        // Public profile only shows approved posts
        setProviderPosts(allPosts.filter((p) => p.status === "approved"));
      } catch (err) {
        console.error("Error fetching provider posts:", err);
      } finally {
        setLoadingPosts(false);
      }
    };
    fetchProviderPosts();
  }, [serviceProviderId]);

  // ── Fetch reviews ──────────────────────────────────────────────────────────

  const fetchReviews = async () => {
    if (!serviceProviderId) return;
    try {
      setLoadingReviews(true);
      const serviceProviderReviews = await reviewService.getReviewsByServiceProvider(serviceProviderId);
      setReviews(serviceProviderReviews);
      const stats = await reviewService.getReviewStats(serviceProviderId);
      setAverageRating(stats.averageRating);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => { fetchReviews(); }, [serviceProviderId]);

  // ── Derived values ─────────────────────────────────────────────────────────

  const providerName = [
    providerData?.displayName || providerData?.firstName || "",
    providerData?.lastName || ""
  ].filter(Boolean).join(" ") || "Service Provider";

  const primaryService = providerData?.availableServices?.[0] || "";

  const TABS: { key: ProfileTab; label: string }[] = [
    { key: "posts",   label: "Posts" },
    { key: "reviews", label: "Reviews" },
  ];

  // ── Back button ────────────────────────────────────────────────────────────

  const BackBtn = () => (
    <button
      onClick={() => navigate("/browseplace")}
      className="relative overflow-hidden flex items-center gap-1.5 bg-[#0072D1] text-white text-xs
      font-bold px-4 py-2.5 rounded-xl transition-all duration-300 hover:bg-black hover:scale-105 group"
    >
      <ChevronLeft className="w-3.5 h-3.5 relative z-10" />
      <span className="relative z-10">Back to Browse</span>
      <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
    </button>
  );

  const AddReviewBtn = ({ small = false }: { small?: boolean }) => (
    <button
      onClick={() => setShowReviewModal(true)}
      className={`relative overflow-hidden flex items-center gap-1.5 bg-black text-white
      font-bold rounded-xl transition-all duration-300 hover:bg-[#0072D1] hover:scale-105 group
      ${small ? "text-xs px-3 py-2" : "text-xs px-4 py-2.5"}`}
    >
      <Star className="w-3.5 h-3.5 relative z-10" />
      <span className="relative z-10">Add Review</span>
      <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
    </button>
  );

  // ── Posts content (shared between desktop + mobile) ────────────────────────

  const PostsContent = () => (
    <>
      {loadingPosts ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#0072D1]"></div>
        </div>
      ) : providerPosts.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="font-bold text-gray-600 mb-1">No posts yet</p>
          <p className="text-sm">This service provider has no approved listings.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {providerPosts.map((p) => (
            <PostCard key={p.id} post={p} onViewDetails={setSelectedPost} />
          ))}
        </div>
      )}
      <Pagination
        current={page}
        total={Math.max(1, Math.ceil(providerPosts.length / 6))}
        onChange={setPage}
      />
    </>
  );

  // ── Reviews content (shared) ───────────────────────────────────────────────

  const ReviewsContent = () => (
    <>
      <ReviewsList
        serviceProviderId={serviceProviderId || ""}
        serviceProviderName={providerName}
        onReviewAdded={fetchReviews}
        readOnly={false}
      />
    </>
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 font-sans">

      {/* ── Cover + Avatar ── */}
      <div className="relative w-full">
        <div className="w-full h-36 md:h-52 overflow-hidden">
          <img src={coverSrc} alt="Cover" className="w-full h-full object-cover" />
        </div>
        <div className="absolute left-6 md:left-8 -bottom-12 md:-bottom-16">
          <div className="w-24 h-24 md:w-36 md:h-36 rounded-[22px] md:rounded-[28px] border-4 border-[#0072D1] bg-white shadow-xl overflow-hidden">
            {profileImageSrc ? (
              <img src={profileImageSrc} alt="Profile" className="w-full h-full object-cover" />
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
            {loading ? (
              <div className="flex justify-center h-16 items-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#0072D1]"></div>
              </div>
            ) : error ? (
              <p className="text-red-500 text-sm">{error}</p>
            ) : (
              <>
                <h2 className="text-xl font-black text-gray-900">{providerName}</h2>
                {primaryService && (
                  <p className="text-base font-bold text-gray-600 mt-1">{primaryService}</p>
                )}
              </>
            )}
          </div>
          <AboutPanel providerData={providerData} />
        </aside>

        {/* RIGHT content */}
        <div className="flex-1 min-w-0">
          {/* Tab bar + action buttons */}
          <div className="flex items-center justify-between border-b border-gray-200 mb-6">
            <div className="flex">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => { setTab(t.key); setPage(1); }}
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
              <AddReviewBtn />
            </div>
          </div>

          {tab === "posts"   && <PostsContent />}
          {tab === "reviews" && <ReviewsContent />}
        </div>
      </div>

      {/* ── MOBILE layout ── */}
      <div className="md:hidden">
        {/* Name + action buttons */}
        <div className="flex flex-col items-center pt-14 pb-3 px-4">
          {loading ? (
            <div className="flex justify-center h-12 items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#0072D1]"></div>
            </div>
          ) : error ? (
            <p className="text-red-500 text-sm">{error}</p>
          ) : (
            <>
              <h2 className="text-base font-black text-gray-900 text-center">
                {providerName}
                {primaryService && <span className="font-normal text-gray-600"> · {primaryService}</span>}
              </h2>
              <div className="flex gap-2 mt-2">
                <BackBtn />
                <AddReviewBtn small />
              </div>
            </>
          )}
        </div>

        {/* Mobile tabs */}
        <div className="flex border-b border-gray-200">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setPage(1); }}
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

        {/* Mobile tab content */}
        <div className="px-4 pt-4 pb-12 space-y-4">
          {tab === "posts"   && <PostsContent />}
          {tab === "reviews" && <ReviewsContent />}
        </div>
      </div>

      {/* ── Full Details Modal ── */}
      {selectedPost && (
        <FullDetailsModal card={selectedPost} onClose={() => setSelectedPost(null)} />
      )}

      {/* ── Review Modal ── */}
      {showReviewModal && serviceProviderId && (
        <ReviewModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          serviceProviderId={serviceProviderId}
          serviceProviderName={providerName}
          onReviewAdded={fetchReviews}
        />
      )}
    </div>
  );
};

export default PublicProfile;