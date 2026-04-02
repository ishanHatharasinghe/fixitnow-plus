import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { userService } from "../services/userService";
import { reviewService } from "../services/reviewService";
import { postService } from "../services/postService";
import { notificationService, type AppNotification } from "../services/notificationService";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import ReviewModal from "../Components/ReviewModal";
import ReviewsList from "../Components/ReviewsList";
import {
  Pencil,
  Plus,
  MapPin,
  Phone,
  Mail,
  MoreVertical,
  User,
  Camera,
  X,
  List,
  Edit,
  Loader,
  Bell,
  CheckCheck,
  CircleCheck,
  BadgeX,
  CalendarCheck,
  MessageSquareWarning,
  BookUp,
  Clock,
  AlertCircle,
  XCircle,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type ProfileTab = "about" | "posts" | "reviews" | "notifications" | "pending" | "declined";

// ─── Data ─────────────────────────────────────────────────────────────────────

const COVER_IMG =
  "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&q=80";

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
    { label: "Included Services Checklist", value: Array.isArray(card.checklist) ? card.checklist.join(", ") : (card.includedServices || "Not specified") },
    { label: "Requirement of Client Provided Materials", value: card.clientMaterials || "Not specified" },
    { label: "Pricing Model", value: card.pricingModel || "Not specified" },
    { label: "Starting Price", value: card.startingPrice ? `LKR ${Number(card.startingPrice).toLocaleString()}` : "Not specified" },
    { label: "Inspection Fee", value: card.inspectionFee ? `LKR ${Number(card.inspectionFee).toLocaleString()}` : "Not specified" },
    { label: "Specific Cities", value: card.specificCities || "Not specified" },
    { label: "Maximum Travel Distance", value: card.travelDistance || "Not specified" },
    { label: "Available Days", value: Array.isArray(card.availableDays) ? card.availableDays.join(", ") : (card.availableDays || "Not specified") },
    { label: "Available Hours", value: card.timeFromHour ? `${card.timeFromHour}:00 ${card.timeFromAmPm} – ${card.timeToHour}:00 ${card.timeToAmPm}` : (card.availableHours || "Not specified") },
    { label: "Emergency Availability", value: card.emergency || "Not specified" }
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
                  <div className="w-full h-56 md:h-[360px] flex items-center justify-center bg-gray-100">
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

// ─── Post Card ────────────────────────────────────────────────────────────────

const PostCard = ({
  post,
  onViewDetails,
  onEdit,
  onDelete
}: {
  post: any;
  onViewDetails: (post: any) => void;
  onEdit: (postId: string) => void;
  onDelete: (postId: string) => void;
}) => {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="relative">
        {post.images && post.images.length > 0 ? (
          <img src={post.images[0]} alt={post.title} className="w-full h-44 object-cover" />
        ) : (
          <div className="w-full h-44 bg-gray-100 flex items-center justify-center">
            <span className="text-sm text-gray-400">No image</span>
          </div>
        )}
        <span className={`absolute top-3 left-3 text-xs font-bold px-3 py-1 rounded-full shadow-sm
          ${post.status === 'approved' ? 'bg-green-100 text-green-800' :
            post.status === 'rejected' ? 'bg-red-100 text-red-800' :
            post.status === 'draft' ? 'bg-gray-100 text-gray-800' :
            'bg-yellow-100 text-yellow-800'}`}>
          {post.status ? post.status.charAt(0).toUpperCase() + post.status.slice(1) : 'Pending'}
        </span>
        <div className="absolute top-3 right-3" ref={menuRef}>
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen(v => !v); }}
            className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center hover:bg-white transition-colors"
          >
            <MoreVertical className="w-4 h-4 text-gray-700" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-10 w-40 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-20">
              <button
                onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onEdit(post.id); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-[#0072D1]/10 hover:text-[#0072D1] transition-colors text-left"
              >
                <Edit className="w-4 h-4" />
                Edit & Resubmit
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDelete(post.id); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors text-left border-t border-gray-100"
              >
                <X className="w-4 h-4" />
                Delete Post
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="p-4 border-x border-b border-[#FF5A00]/30 rounded-b-2xl">
        <h3 className="font-black text-gray-900 text-base leading-snug mb-1">{post.title}</h3>
        <div className="flex items-center gap-1 text-gray-400 text-xs mb-2">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          <span>{post.location}</span>
        </div>
        {post.status === 'rejected' && post.rejectionReason && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-2 mb-2">
            <p className="text-xs font-bold text-red-600 mb-0.5">Rejection Reason:</p>
            <p className="text-xs text-red-600">{post.rejectionReason}</p>
          </div>
        )}
        <p className="text-gray-500 text-xs leading-relaxed mb-3 line-clamp-3">
          {post.description || "No description provided"}
        </p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600 mb-4">
          <span className="flex items-center gap-1"><Phone className="w-3 h-3" />+94 {post.mobile}</span>
          <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{post.email}</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onViewDetails(post)}
            className="relative overflow-hidden flex-1 bg-[#FF5A00] text-white font-bold text-xs py-2.5 rounded-lg transition-all duration-300 hover:bg-black hover:scale-105 group"
          >
            <span className="relative z-10">View Full Details</span>
            <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Pending Posts Panel ──────────────────────────────────────────────────────

const PendingPostsPanel = ({
  posts,
  loading,
  onViewDetails,
  onEdit,
  onDelete,
}: {
  posts: any[];
  loading: boolean;
  onViewDetails: (post: any) => void;
  onEdit: (postId: string) => void;
  onDelete: (postId: string) => void;
}) => {
  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader className="w-6 h-6 animate-spin text-[#0072D1]" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-2xl">
        <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
          <Clock className="w-5 h-5 text-yellow-600" />
        </div>
        <div>
          <p className="text-sm font-black text-yellow-800">Awaiting Review</p>
          <p className="text-xs text-yellow-700">
            {posts.length === 0
              ? "No posts are currently pending review."
              : `${posts.length} post${posts.length !== 1 ? "s" : ""} waiting for admin approval.`}
          </p>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <div className="w-16 h-16 rounded-full bg-yellow-50 flex items-center justify-center mb-4">
            <Clock className="w-7 h-7 text-yellow-300" />
          </div>
          <p className="font-bold text-gray-500 mb-1">No pending posts</p>
          <p className="text-sm text-center max-w-xs">
            Posts awaiting admin review will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {posts.map((p) => (
            <PostCard key={p.id} post={p} onViewDetails={onViewDetails} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Declined Posts Panel ─────────────────────────────────────────────────────

const DeclinedPostsPanel = ({
  posts,
  loading,
  onViewDetails,
  onEdit,
  onDelete,
}: {
  posts: any[];
  loading: boolean;
  onViewDetails: (post: any) => void;
  onEdit: (postId: string) => void;
  onDelete: (postId: string) => void;
}) => {
  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader className="w-6 h-6 animate-spin text-[#0072D1]" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl">
        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
          <AlertCircle className="w-5 h-5 text-red-600" />
        </div>
        <div>
          <p className="text-sm font-black text-red-800">Declined Posts</p>
          <p className="text-xs text-red-700">
            {posts.length === 0
              ? "None of your posts have been declined."
              : `${posts.length} post${posts.length !== 1 ? "s" : ""} declined. Edit and resubmit to request another review.`}
          </p>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
            <XCircle className="w-7 h-7 text-red-200" />
          </div>
          <p className="font-bold text-gray-500 mb-1">No declined posts</p>
          <p className="text-sm text-center max-w-xs">
            Posts that have been declined by an admin will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {posts.map((p) => (
            <PostCard key={p.id} post={p} onViewDetails={onViewDetails} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </div>
      )}
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
      className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#FF5A00] hover:text-[#FF5A00] disabled:opacity-30 transition-colors text-base"
    >
      ‹
    </button>
    {Array.from({ length: total }, (_, i) => i + 1).map((p) => (
      <button
        key={p}
        onClick={() => onChange(p)}
        className={`w-8 h-8 rounded-full text-sm font-bold transition-all duration-200
          ${p === current
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
      className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#FF5A00] hover:text-[#FF5A00] disabled:opacity-30 transition-colors text-base"
    >
      ›
    </button>
  </div>
);

// ─── About Panel ──────────────────────────────────────────────────────────────

const AboutPanel = ({ providerData, loading, error }: { providerData: any; loading: boolean; error: string | null }) => (
  <div className="space-y-4">
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-900 text-sm">About me</h3>
        <User className="w-5 h-5 text-gray-400" />
      </div>
      <p className="text-xs text-gray-600 leading-relaxed">
        {providerData?.bio || 'Welcome to my profile'}
      </p>
    </div>
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-900 text-sm">Location</h3>
        <MapPin className="w-5 h-5 text-gray-400" />
      </div>
      <p className="text-xs text-gray-600 leading-relaxed">
        {providerData?.address
          ? typeof providerData.address === 'string'
            ? providerData.address
            : `${providerData.address.street || ''}, ${providerData.address.city || ''}, ${providerData.address.country || ''}`
          : 'Level 5, Hemas House No 75 Bray-brooke place, Colombo 02'
        }
      </p>
    </div>
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-900 text-sm">Available Services</h3>
        <List className="w-5 h-5 text-gray-400" />
      </div>
      <div className="flex flex-wrap gap-2">
        {providerData?.availableServices && providerData.availableServices.length > 0 ? (
          providerData.availableServices.map((service: string, index: number) => (
            <span key={index} className="px-2 py-1 bg-[#0072D1]/10 text-[#0072D1] text-xs rounded-full">
              {service}
            </span>
          ))
        ) : (
          <span className="px-2 py-1 bg-gray-200 text-gray-500 text-xs rounded-full">No services listed</span>
        )}
      </div>
    </div>
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-900 text-sm">Contact</h3>
        <Phone className="w-5 h-5 text-gray-400" />
      </div>
      <div className="space-y-1">
        <p className="text-xs text-gray-600"><span className="font-bold">Phone:</span> {providerData?.phoneNumber || 'Not provided'}</p>
        <p className="text-xs text-gray-600"><span className="font-bold">Email:</span> {providerData?.email || 'Not provided'}</p>
      </div>
    </div>
    <p className="text-xs font-bold text-gray-600 px-1">
      Member since : {providerData?.createdAt ? new Date(providerData.createdAt).toLocaleDateString() : 'December 28, 2018'}
    </p>
  </div>
);

// ─── Notifications Panel ──────────────────────────────────────────────────────

const NotificationsPanel = ({
  notifications,
  loading,
  onMarkAllRead,
  onMarkOneRead,
  onNotificationClick,
}: {
  notifications: AppNotification[];
  loading: boolean;
  onMarkAllRead: () => void;
  onMarkOneRead: (id: string) => void;
  onNotificationClick?: (notif: AppNotification) => void;
}) => {
  const unread = notifications.filter((n) => !n.read).length;

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader className="w-6 h-6 animate-spin text-[#0072D1]" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-[#0072D1]" />
          <h3 className="font-black text-gray-900 text-base">Notifications</h3>
          {unread > 0 && (
            <span className="bg-[#FF5A00] text-white text-[10px] font-black px-2 py-0.5 rounded-full">
              {unread} unread
            </span>
          )}
        </div>
        {unread > 0 && (
          <button
            onClick={onMarkAllRead}
            className="flex items-center gap-1.5 text-xs text-[#0072D1] font-bold hover:underline"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Bell className="w-7 h-7 text-gray-300" />
          </div>
          <p className="font-bold text-gray-500 mb-1">No notifications yet</p>
          <p className="text-sm text-center max-w-xs">
            You'll receive notifications here when your posts are approved or rejected.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => {
                if (!notif.read) onMarkOneRead(notif.id);
                if (onNotificationClick) onNotificationClick(notif);
              }}
              className={`flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer hover:shadow-sm
                ${!notif.read
                  ? "bg-[#0072D1]/5 border-[#0072D1]/20 hover:bg-[#0072D1]/8"
                  : "bg-white border-gray-100 hover:bg-gray-50"
                }`}
            >
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
                ${(notif.type === "post_approved" || notif.type === "booking_approved") ? "bg-green-100" : notif.type === "booking_request" ? "bg-purple-100" : notif.type === "new_message" ? "bg-blue-100" : "bg-red-100"}`}>
                {notif.type === "post_approved"
                  ? <CircleCheck className="w-5 h-5 text-green-600" />
                  : notif.type === "booking_approved"
                  ? <CalendarCheck className="w-5 h-5 text-green-600" />
                  : notif.type === "booking_request"
                  ? <BookUp className="w-5 h-5 text-purple-600" />
                  : notif.type === "new_message"
                  ? <MessageSquareWarning className="w-5 h-5 text-blue-600" />
                  : <BadgeX className="w-5 h-5 text-red-500" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-bold leading-snug
                    ${(notif.type === "post_approved" || notif.type === "booking_approved") ? "text-green-700" : notif.type === "booking_request" ? "text-purple-700" : notif.type === "new_message" ? "text-blue-700" : "text-red-600"}`}>
                    {notif.title}
                  </p>
                  {!notif.read && (
                    <span className="flex-shrink-0 w-2.5 h-2.5 rounded-full bg-[#FF5A00] mt-1" />
                  )}
                </div>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">{notif.message}</p>
                <p className="text-[11px] text-gray-400 mt-2 font-medium">
                  {notif.createdAt.toLocaleDateString(undefined, {
                    year: "numeric", month: "short", day: "numeric",
                    hour: "2-digit", minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const UserProfile: React.FC = () => {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<ProfileTab>("about");
  const [page, setPage] = useState(1);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [coverSrc, setCoverSrc] = useState<string>(COVER_IMG);
  const [profileImageSrc, setProfileImageSrc] = useState<string>("");
  const [selectedPost, setSelectedPost] = useState<any>(null);

  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  const [providerData, setProviderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [providerPosts, setProviderPosts] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  const coverRef = React.useRef<HTMLInputElement>(null);
  const profileImageRef = React.useRef<HTMLInputElement>(null);

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [editFormData, setEditFormData] = useState<any>({});

  // ── Notifications ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!currentUser?.uid) {
      setNotifications([]);
      setLoadingNotifications(false);
      return;
    }
    setLoadingNotifications(true);
    const unsub = notificationService.subscribeToNotifications(
      currentUser.uid,
      (notifs) => {
        setNotifications(notifs);
        setLoadingNotifications(false);
      }
    );
    return () => unsub();
  }, [currentUser?.uid]);

  const unreadNotifCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = async () => {
    if (!currentUser?.uid) return;
    try {
      await notificationService.markAllAsRead(currentUser.uid);
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  };

  const handleMarkOneRead = async (notifId: string) => {
    try {
      await notificationService.markAsRead(notifId);
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleNotificationClick = (notif: AppNotification) => {
    // Navigate based on notification type, matching navbar behavior
    if (notif.type === "new_message" && notif.conversationId) {
      // Open messaging - navigate to profile with messages focus
      navigate("/profile");
      return;
    }

    if (notif.type === "post_approved" || notif.type === "post_declined") {
      // Navigate to posts tab
      setTab("posts");
      return;
    }

    if (notif.type === "booking_approved" || notif.type === "booking_declined" || notif.type === "booking_request") {
      // Navigate to bookings page
      navigate("/bookings");
      return;
    }

    // Default: stay on notifications tab
    setTab("notifications");
  };

  // ── Fetch posts ───────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchProviderPosts = async () => {
      if (!currentUser?.uid) return;
      try {
        setLoadingPosts(true);
        const allPosts = await postService.getPostsByServiceProvider(currentUser.uid);
        setProviderPosts(allPosts);
      } catch (err) {
        console.error('Error fetching provider posts:', err);
      } finally {
        setLoadingPosts(false);
      }
    };
    fetchProviderPosts();
  }, [currentUser?.uid]);

  // ── Derived post lists ────────────────────────────────────────────────────
  const approvedPosts = providerPosts.filter(p => p.status === 'approved');
  const pendingPosts  = providerPosts.filter(p => !p.status || p.status === 'pending');
  const declinedPosts = providerPosts.filter(p => p.status === 'rejected');

  // ── Fetch provider profile ────────────────────────────────────────────────
  useEffect(() => {
    const fetchProviderData = async () => {
      if (!currentUser?.uid) return;
      try {
        setLoading(true);
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setProviderData(userDoc.data());
        } else {
          setError('Provider data not found');
        }
      } catch (err) {
        console.error('Error fetching provider data:', err);
        setError('Failed to load provider data');
      } finally {
        setLoading(false);
      }
    };
    fetchProviderData();
  }, [currentUser?.uid]);

  // ── Fetch reviews ─────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchReviews = async () => {
      if (!currentUser) return;
      try {
        setLoadingReviews(true);
        const serviceProviderReviews = await reviewService.getReviewsByServiceProvider(currentUser.uid);
        setReviews(serviceProviderReviews);
        const stats = await reviewService.getReviewStats(currentUser.uid);
        setAverageRating(stats.averageRating);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoadingReviews(false);
      }
    };
    fetchReviews();
  }, [currentUser]);

  useEffect(() => {
    if (userProfile) {
      setEditFormData({
        displayName: userProfile.displayName || "",
        phoneNumber: userProfile.phoneNumber || "",
        address: userProfile.address || "",
        nic: userProfile.nic || ""
      });
    }
  }, [userProfile]);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setCoverSrc(URL.createObjectURL(f));
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setProfileImageSrc(URL.createObjectURL(f));
  };

  const handleEditPost = (postId: string) => {
    navigate(`/add-post/${postId}`);
  };

  const handleDeletePost = async (postId: string) => {
  const post = providerPosts.find(p => p.id === postId);
  const statusLabel = post?.status === 'approved'
    ? 'approved (it will be removed from public listings)'
    : post?.status ?? 'this';

  if (!window.confirm(
    `Are you sure you want to delete this ${statusLabel} post? This cannot be undone.`
  )) return;

  try {
    await postService.deletePost(postId);
    setProviderPosts(prev => prev.filter(p => p.id !== postId));
  } catch (err: any) {
    console.error("Error deleting post:", err);
    if (err?.code === 'permission-denied') {
      alert("Permission denied. You can only delete your own posts.");
    } else {
      alert("Failed to delete post. Please try again.");
    }
  }
};

  const handleEditProfileClick = () => {
    navigate('/edit-profile');
  };

  // ── Tab definitions ───────────────────────────────────────────────────────
  const TABS: { key: ProfileTab; label: string; badge?: number }[] = [
    { key: "about",         label: "About" },
    { key: "posts",         label: "Posts" },
    { key: "pending",       label: "Pending",  badge: pendingPosts.length },
    { key: "declined",      label: "Declined", badge: declinedPosts.length },
    { key: "reviews",       label: "Reviews" },
    { key: "notifications", label: "Notifications", badge: unreadNotifCount },
  ];

  // Desktop tabs exclude "about" (always in sidebar)
  const DESKTOP_TABS = TABS.filter(t => t.key !== "about");

  const rightBtnLabel = tab === "reviews" ? "Add Review" : "Add New Post";
  const showAddBtn = tab !== "notifications" && tab !== "pending" && tab !== "declined";

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* ── Cover + Avatar ── */}
      <div className="relative w-full">
        <div className="w-full h-36 md:h-52 overflow-hidden">
          <img src={coverSrc} alt="Cover" className="w-full h-full object-cover" />
        </div>
        <button
          onClick={() => coverRef.current?.click()}
          className="absolute top-3 md:top-auto md:bottom-3 right-3 z-10 flex items-center gap-1.5
            bg-black/60 hover:bg-[#0072D1] text-white text-xs font-bold
            px-3 py-1.5 rounded-xl transition-colors shadow-lg backdrop-blur-sm"
        >
          <Camera className="w-3.5 h-3.5" /> Edit Cover
        </button>
        <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />

        {/* Avatar */}
        <div className="absolute left-6 md:left-8 -bottom-12 md:-bottom-16">
          <div className="relative">
            <div className="w-24 h-24 md:w-36 md:h-36 rounded-[22px] md:rounded-[28px] border-4 border-[#0072D1] bg-white shadow-xl overflow-hidden">
              {profileImageSrc && (
                <img src={profileImageSrc} alt="Profile" className="w-full h-full object-cover" />
              )}
            </div>
            <button
              onClick={() => profileImageRef.current?.click()}
              className="absolute bottom-0 right-0 flex items-center justify-center w-9 h-9 md:w-11 md:h-11
                bg-[#0072D1] hover:bg-black text-white rounded-full shadow-lg transition-colors"
            >
              <Camera className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        </div>
        <input ref={profileImageRef} type="file" accept="image/*" className="hidden" onChange={handleProfileImageChange} />
      </div>

      {/* ── DESKTOP layout ── */}
      <div className="hidden md:flex gap-6 max-w-7xl mx-auto px-6 mt-20 pb-12">
        {/* LEFT sidebar */}
        <aside className="w-64 flex-shrink-0">
          <div className="text-center mb-5">
            {loading ? (
              <div className="flex items-center justify-center h-16">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#0072D1]"></div>
              </div>
            ) : error ? (
              <p className="text-red-500 text-sm">{error}</p>
            ) : (
              <>
                <h2 className="text-xl font-black text-gray-900">
                  {providerData?.firstName || 'Full Name'} {providerData?.lastName || ''}
                </h2>
                <p className="text-lg font-black text-gray-900">
                  {providerData?.availableServices?.[0] || 'Plumber'}
                </p>
              </>
            )}
          </div>
          <AboutPanel providerData={providerData} loading={loading} error={error} />
        </aside>

        {/* RIGHT content */}
        <div className="flex-1 min-w-0">
          {/* Tab bar + action buttons */}
          <div className="flex items-center justify-between border-b border-gray-200 mb-6">
            <div className="flex">
              {DESKTOP_TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => { setTab(t.key); setPage(1); }}
                  className={`relative px-5 py-3 text-sm font-bold border-b-2 transition-all
                    ${tab === t.key
                      ? "text-gray-900 border-gray-900"
                      : "text-gray-500 border-transparent hover:text-gray-700"
                    }`}
                >
                  {t.label}
                  {/* Badge for pending (yellow), declined (red), notifications (orange) */}
                  {t.badge != null && t.badge > 0 && (
                    <span className={`absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] text-white text-[9px] font-black rounded-full flex items-center justify-center px-1
                      ${t.key === "pending"  ? "bg-yellow-500" :
                        t.key === "declined" ? "bg-red-500"    :
                        "bg-[#FF5A00]"}`}>
                      {t.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 pb-1">
              <button
                onClick={handleEditProfileClick}
                className="relative overflow-hidden flex items-center gap-1.5 bg-[#0072D1] text-white text-xs
                  font-bold px-4 py-2.5 rounded-xl transition-all duration-300 hover:bg-black hover:scale-105 group"
              >
                <Pencil className="w-3.5 h-3.5 relative z-10" />
                <span className="relative z-10">Edit Profile</span>
                <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </button>
              {showAddBtn && (
                <button
                  onClick={() => {
                    if (tab === "reviews") setShowReviewModal(true);
                    else navigate('/add-post');
                  }}
                  className="relative overflow-hidden flex items-center gap-1.5 bg-black text-white text-xs
                    font-bold px-4 py-2.5 rounded-xl transition-all duration-300 hover:bg-[#0072D1] hover:scale-105 group"
                >
                  <Plus className="w-3.5 h-3.5 relative z-10" />
                  <span className="relative z-10">{rightBtnLabel}</span>
                  <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </button>
              )}
            </div>
          </div>

          {/* ── Tab content ── */}

          {/* Approved Posts */}
          {(tab === "posts" || tab === "about") && (
            <>
              {loadingPosts ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#0072D1]"></div>
                </div>
              ) : approvedPosts.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <p className="font-bold text-gray-600 mb-1">No approved posts yet</p>
                  <p className="text-sm">Create your first service listing to get started.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-5">
                  {approvedPosts.map((p) => (
                    <PostCard key={p.id} post={p} onViewDetails={setSelectedPost} onEdit={handleEditPost} onDelete={handleDeletePost} />
                  ))}
                </div>
              )}
              <Pagination current={page} total={Math.max(1, Math.ceil(approvedPosts.length / 6))} onChange={setPage} />
            </>
          )}

          {/* Pending Posts */}
          {tab === "pending" && (
            <PendingPostsPanel
              posts={pendingPosts}
              loading={loadingPosts}
              onViewDetails={setSelectedPost}
              onEdit={handleEditPost}
              onDelete={handleDeletePost}
            />
          )}

          {/* Declined Posts */}
          {tab === "declined" && (
            <DeclinedPostsPanel
              posts={declinedPosts}
              loading={loadingPosts}
              onViewDetails={setSelectedPost}
              onEdit={handleEditPost}
              onDelete={handleDeletePost}
            />
          )}

          {/* Reviews */}
          {tab === "reviews" && (
            <ReviewsList
              serviceProviderId={currentUser?.uid || ""}
              serviceProviderName={userProfile?.displayName || currentUser?.email || "Service Provider"}
              onReviewAdded={() => setShowReviewModal(false)}
            />
          )}

          {/* Notifications */}
          {tab === "notifications" && (
            <NotificationsPanel
              notifications={notifications}
              loading={loadingNotifications}
              onMarkAllRead={handleMarkAllRead}
              onMarkOneRead={handleMarkOneRead}
              onNotificationClick={handleNotificationClick}
            />
          )}
        </div>
      </div>

      {/* ── MOBILE layout ── */}
      <div className="md:hidden">
        {/* Name + Edit Profile */}
        <div className="flex flex-col items-center pt-14 pb-3 px-4">
          {loading ? (
            <div className="flex items-center justify-center h-12">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#0072D1]"></div>
            </div>
          ) : error ? (
            <p className="text-red-500 text-sm">{error}</p>
          ) : (
            <>
              <h2 className="text-base font-black text-gray-900">
                {providerData?.firstName || 'Full Name'} {providerData?.lastName || ''}{' '}
                <span className="font-black">({providerData?.availableServices?.[0] || 'Plumber'})</span>
              </h2>
              <button
                onClick={handleEditProfileClick}
                className="relative overflow-hidden mt-2 flex items-center gap-1.5 bg-[#0072D1] text-white
                  text-xs font-bold px-4 py-2 rounded-xl transition-all duration-300 hover:bg-black hover:scale-105 group"
              >
                <Pencil className="w-3 h-3 relative z-10" />
                <span className="relative z-10">Edit Profile</span>
                <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </button>
            </>
          )}
        </div>

        {/* Mobile tabs — scrollable row */}
        <div className="flex overflow-x-auto border-b border-gray-200 scrollbar-none">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setPage(1); }}
              className={`relative flex-shrink-0 px-4 py-3 text-xs font-bold border-b-2 transition-all
                ${tab === t.key
                  ? "text-[#0072D1] border-[#0072D1]"
                  : "text-gray-400 border-transparent"
                }`}
            >
              {t.label}
              {t.badge != null && t.badge > 0 && (
                <span className={`absolute top-1.5 right-0.5 min-w-[15px] h-[15px] text-white text-[8px] font-black rounded-full flex items-center justify-center px-0.5
                  ${t.key === "pending"  ? "bg-yellow-500" :
                    t.key === "declined" ? "bg-red-500"    :
                    "bg-[#FF5A00]"}`}>
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Mobile tab content */}
        <div className="px-4 pt-4 pb-12 space-y-4">
          {tab === "about" && <AboutPanel providerData={providerData} loading={loading} error={error} />}

          {tab === "posts" && (
            <>
              <button
                onClick={() => navigate('/add-post')}
                className="relative overflow-hidden w-full flex items-center justify-center gap-2 bg-black text-white
                  font-bold py-3.5 rounded-xl transition-all duration-300 hover:bg-[#0072D1] hover:scale-[1.01] group text-sm shadow-sm"
              >
                <Plus className="w-4 h-4 relative z-10" />
                <span className="relative z-10">Add New Post</span>
                <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </button>
              {loadingPosts ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#0072D1]"></div>
                </div>
              ) : approvedPosts.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p className="font-bold text-gray-600 mb-1">No approved posts yet</p>
                  <p className="text-sm">Create your first service listing.</p>
                </div>
              ) : (
                approvedPosts.map((p) => (
                  <PostCard key={p.id} post={p} onViewDetails={setSelectedPost} onEdit={handleEditPost} onDelete={handleDeletePost} />
                ))
              )}
              <Pagination current={page} total={Math.max(1, Math.ceil(approvedPosts.length / 6))} onChange={setPage} />
            </>
          )}

          {tab === "pending" && (
            <PendingPostsPanel
              posts={pendingPosts}
              loading={loadingPosts}
              onViewDetails={setSelectedPost}
              onEdit={handleEditPost}
              onDelete={handleDeletePost}
            />
          )}

          {tab === "declined" && (
            <DeclinedPostsPanel
              posts={declinedPosts}
              loading={loadingPosts}
              onViewDetails={setSelectedPost}
              onEdit={handleEditPost}
              onDelete={handleDeletePost}
            />
          )}

          {tab === "reviews" && (
            <ReviewsList
              serviceProviderId={currentUser?.uid || ""}
              serviceProviderName={userProfile?.displayName || currentUser?.email || "Service Provider"}
              onReviewAdded={() => setShowReviewModal(false)}
            />
          )}

          {tab === "notifications" && (
            <NotificationsPanel
              notifications={notifications}
              loading={loadingNotifications}
              onMarkAllRead={handleMarkAllRead}
              onMarkOneRead={handleMarkOneRead}
              onNotificationClick={handleNotificationClick}
            />
          )}
        </div>
      </div>

      {/* ── Full Details Modal ── */}
      {selectedPost && (
        <FullDetailsModal card={selectedPost} onClose={() => setSelectedPost(null)} />
      )}

      {/* ── Add Review Modal ── */}
      {showReviewModal && currentUser && (
        <ReviewModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          serviceProviderId={currentUser.uid}
          serviceProviderName={userProfile?.displayName || currentUser.email || "Service Provider"}
        />
      )}
    </div>
  );
};

export default UserProfile;