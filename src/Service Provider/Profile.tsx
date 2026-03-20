import React, { useState, useEffect } from "react";
import {
  Pencil,
  Plus,
  MapPin,
  Phone,
  Mail,
  Heart,
  CornerDownLeft,
  MoreVertical,
  User,
  Camera,
  X,
  List
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type ProfileTab = "about" | "posts" | "drafts" | "reviews";

// ─── Data ─────────────────────────────────────────────────────────────────────

const COVER_IMG =
  "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&q=80";

const MOCK_EXTRAS = {
  includedServices:
    "Tap repairs, drain cleaning, water tank installation, pipe routing, commode fitting",
  clientMaterials: "Yes",
  pricingModel: "Upon Inspection",
  startingPrice: "LKR 1,500",
  inspectionFee: "LKR 1,000",
  specificCities: "Moratuwa, Panadura, Ratmalana",
  travelDistance: "15 km",
  availableDays:
    "Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday",
  availableHours: "07:00 AM – 07:00 PM",
  emergency: "Yes"
};

const POSTS = [
  {
    id: 1,
    status: "Pending Post",
    title: "Expert House Plumber – Fast Leak Repairs",
    location: "Location",
    description:
      "Professional plumber with 10 years of experience. Specializing in home plumbing, leak repairs, PVC pipe installations, and water pump setups.",
    phone: "+94 703215789",
    email: "sample@gmail.com",
    img: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=600&q=80",
    images: [
      "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=600&q=80",
      "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=600&q=80",
      "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=600&q=80"
    ],
    ...MOCK_EXTRAS
  },
  {
    id: 2,
    status: "Pending Post",
    title: "Expert House Plumber – Fast Leak Repairs",
    location: "Location",
    description:
      "Professional plumber with 10 years of experience. Specializing in home plumbing, leak repairs, PVC pipe installations, and water pump setups.",
    phone: "+94 703215789",
    email: "sample@gmail.com",
    img: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=600&q=80",
    images: [
      "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=600&q=80",
      "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=600&q=80",
      "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=600&q=80"
    ],
    ...MOCK_EXTRAS
  }
];

const DRAFTS = [
  {
    id: 3,
    status: "Draft Post",
    title: "Expert House Plumber – Fast Leak Repairs",
    location: "Location",
    description:
      "Professional plumber with 10 years of experience. Specializing in home plumbing, leak repairs, PVC pipe installations, and water pump setups.",
    phone: "+94 703215789",
    email: "sample@gmail.com",
    img: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=600&q=80",
    images: [
      "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=600&q=80"
    ],
    ...MOCK_EXTRAS
  },
  {
    id: 4,
    status: "Draft Post",
    title: "Expert House Plumber – Fast Leak Repairs",
    location: "Location",
    description:
      "Professional plumber with 10 years of experience. Specializing in home plumbing, leak repairs, PVC pipe installations, and water pump setups.",
    phone: "+94 703215789",
    email: "sample@gmail.com",
    img: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=600&q=80",
    images: [
      "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=600&q=80"
    ],
    ...MOCK_EXTRAS
  },
  {
    id: 5,
    status: "Draft Post",
    title: "Expert House Plumber – Fast Leak Repairs",
    location: "Location",
    description:
      "Professional plumber with 10 years of experience. Specializing in home plumbing, leak repairs, PVC pipe installations, and water pump setups.",
    phone: "+94 703215789",
    email: "sample@gmail.com",
    img: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=600&q=80",
    images: [
      "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=600&q=80"
    ],
    ...MOCK_EXTRAS
  }
];

const REVIEWS = [
  {
    id: 1,
    reviewer: "Adam Sandler",
    avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&q=80",
    time: "1 hour ago",
    text: "We are so grateful for the incredible wedding photos you captured! Every moment feels alive in the pictures, and we can't stop looking at them. Thank you for making our day so memorable!",
    likes: "100k"
  },
  {
    id: 2,
    reviewer: "Adam Sandler",
    avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&q=80",
    time: "1 hour ago",
    text: "We are so grateful for the incredible wedding photos you captured! Every moment feels alive in the pictures, and we can't stop looking at them. Thank you for making our day so memorable!",
    likes: "100k"
  }
];

// ─── Full Details Modal ───────────────────────────────────────────────────────

const FullDetailsModal = ({
  card,
  onClose
}: {
  card: any;
  onClose: () => void;
}) => {
  const [activeImg, setActiveImg] = useState(0);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const details = [
    { label: "Included Services Checklist", value: card.includedServices },
    {
      label: "Requirement of Client Provided Materials",
      value: card.clientMaterials
    },
    { label: "Pricing Model", value: card.pricingModel },
    { label: "Starting Price", value: card.startingPrice },
    { label: "Inspection Fee", value: card.inspectionFee },
    { label: "Specific Cities", value: card.specificCities },
    { label: "Maximum Travel Distance", value: card.travelDistance },
    { label: "Available Days", value: card.availableDays },
    { label: "Available Hours", value: card.availableHours },
    { label: "Emergency Availability", value: card.emergency }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal card — matches the screenshot layout */}
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-[#0072D1]/30 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-gray-100 hover:bg-red-100 hover:text-red-500 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 p-6 md:p-8">
          {/* Title + location */}
          <h2 className="font-black text-gray-900 text-xl md:text-2xl leading-tight mb-1 pr-8">
            {card.title}
          </h2>
          <div className="flex items-center gap-1.5 text-gray-400 mb-5">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="text-sm font-medium">{card.location}</span>
          </div>

          {/* Main content: image left + details right (desktop) / stacked (mobile) */}
          <div className="flex flex-col md:flex-row gap-6 md:gap-8">
            {/* LEFT: Image carousel */}
            <div className="w-full md:w-[52%] flex-shrink-0">
              <div className="relative rounded-2xl overflow-hidden bg-gray-100">
                <img
                  src={card.images[activeImg]}
                  alt={card.title}
                  className="w-full h-56 md:h-[360px] object-cover"
                />
                {/* Dot indicators */}
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
              </div>

              {/* Details section below image */}
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

            {/* RIGHT: Info list */}
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

              {/* Contact + View Service Owner */}
              <div className="mt-6 pt-5 border-t border-gray-100">
                <div className="flex flex-wrap items-center gap-5 mb-4">
                  <span className="flex items-center gap-1.5 text-sm font-bold text-gray-800">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    {card.phone}
                  </span>
                  <span className="flex items-center gap-1.5 text-sm font-bold text-gray-800">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    {card.email}
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
  onViewDetails
}: {
  post: (typeof POSTS)[0];
  onViewDetails: (post: any) => void;
}) => (
  <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="relative">
      <img
        src={post.img}
        alt={post.title}
        className="w-full h-44 object-cover"
      />
      <span className="absolute top-3 left-3 bg-white text-gray-800 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
        {post.status}
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
      <p className="text-gray-500 text-xs leading-relaxed mb-3">
        {post.description}
      </p>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600 mb-4">
        <span className="flex items-center gap-1">
          <Phone className="w-3 h-3" />
          {post.phone}
        </span>
        <span className="flex items-center gap-1">
          <Mail className="w-3 h-3" />
          {post.email}
        </span>
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

// ─── Review Card ──────────────────────────────────────────────────────────────

const ReviewCard = ({ review }: { review: (typeof REVIEWS)[0] }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        <img
          src={review.avatar}
          alt={review.reviewer}
          className="w-11 h-11 rounded-full object-cover flex-shrink-0"
        />
        <div>
          <p className="font-bold text-gray-900 text-sm">{review.reviewer}</p>
          <p className="text-xs text-gray-400">{review.time}</p>
        </div>
      </div>
      <button className="text-gray-400 hover:text-gray-600 transition-colors">
        <MoreVertical className="w-4 h-4" />
      </button>
    </div>
    <p className="text-sm text-gray-700 leading-relaxed mb-5">{review.text}</p>
    <div className="flex items-center justify-between">
      <button className="flex items-center gap-1.5 text-gray-600 hover:text-red-500 transition-colors">
        <Heart className="w-4 h-4" />
        <span className="text-sm font-bold">{review.likes}</span>
      </button>
      <button className="flex items-center gap-1.5 text-gray-600 hover:text-[#0072D1] font-bold text-sm transition-colors">
        Reply <CornerDownLeft className="w-3.5 h-3.5" />
      </button>
    </div>
  </div>
);

// ─── Add Review Modal ─────────────────────────────────────────────────────────

const AddReviewModal = ({ onClose }: { onClose: () => void }) => {
  const [name, setName] = React.useState("");
  const [review, setReview] = React.useState("");

  // Lock body scroll
  React.useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Close on Escape
  React.useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const handleSubmit = () => {
    if (!name.trim() || !review.trim()) return;
    // TODO: submit review
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal card — matches screenshot */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 md:p-8">
        {/* Close button top-right */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full border-2 border-[#0072D1]
            flex items-center justify-center text-[#0072D1] hover:bg-[#0072D1] hover:text-white
            transition-colors"
        >
          {/* X inside a circle — matches the ⊗ icon in the screenshot */}
          <svg
            viewBox="0 0 24 24"
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
          </svg>
        </button>

        {/* Name field */}
        <div className="mb-5">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder=""
            className="w-full border border-[#0072D1]/40 rounded-2xl px-4 py-3 text-sm text-gray-700
              outline-none focus:border-[#0072D1] focus:ring-2 focus:ring-[#0072D1]/15
              transition-colors bg-gray-50"
          />
        </div>

        {/* Review field */}
        <div className="mb-7">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Review
          </label>
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            rows={5}
            placeholder=""
            className="w-full border border-[#0072D1]/40 rounded-2xl px-4 py-3 text-sm text-gray-700
              outline-none focus:border-[#0072D1] focus:ring-2 focus:ring-[#0072D1]/15
              transition-colors bg-gray-50 resize-none"
          />
        </div>

        {/* Add Review button */}
        <button
          onClick={handleSubmit}
          className="relative overflow-hidden w-full bg-[#0072D1] text-white font-bold
            py-3.5 rounded-2xl text-sm transition-all duration-300 hover:bg-black
            hover:scale-[1.01] group shadow-md"
        >
          <span className="relative z-10">Add Review</span>
          <div
            className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full
            group-hover:translate-x-full transition-transform duration-700 rounded-2xl"
          />
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
      className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#FF5A00] hover:text-[#FF5A00] disabled:opacity-30 transition-colors text-base"
    >
      ‹
    </button>
    {Array.from({ length: total }, (_, i) => i + 1).map((p) => (
      <button
        key={p}
        onClick={() => onChange(p)}
        className={`w-8 h-8 rounded-full text-sm font-bold transition-all duration-200
          ${
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
      className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#FF5A00] hover:text-[#FF5A00] disabled:opacity-30 transition-colors text-base"
    >
      ›
    </button>
  </div>
);

// ─── About Panel (sidebar on desktop, tab content on mobile) ──────────────────

const AboutPanel = () => (
  <div className="space-y-4">
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-900 text-sm">About me</h3>
        <User className="w-5 h-5 text-gray-400" />
      </div>
      <p className="text-xs text-gray-600 leading-relaxed">
        Lorem Ipsum is simply dummy text of the printing and typesetting
        industry. Lorem Ipsum has been the industry's standard dummy text ever
        since the 1500s, when an unknown printer took a galley of type and
        scrambled it to make a type specimen book.
      </p>
    </div>
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-900 text-sm">Location</h3>
        <MapPin className="w-5 h-5 text-gray-400" />
      </div>
      <p className="text-xs text-gray-600 leading-relaxed">
        Level 5, Hemas House No 75 Bray-brooke place, Colombo 02
      </p>
    </div>
    <p className="text-xs font-bold text-gray-600 px-1">
      Member since : December 28, 2018
    </p>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const UserProfile: React.FC = () => {
  const [tab, setTab] = useState<ProfileTab>("about");
  const [page, setPage] = useState(1);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [coverSrc, setCoverSrc] = useState<string>(COVER_IMG);
  const [profileImageSrc, setProfileImageSrc] = useState<string>("");
  const [selectedPost, setSelectedPost] = useState<any>(null); // State for the full details modal
  const coverRef = React.useRef<HTMLInputElement>(null);
  const profileImageRef = React.useRef<HTMLInputElement>(null);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setCoverSrc(URL.createObjectURL(f));
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setProfileImageSrc(URL.createObjectURL(f));
  };

  const TABS: { key: ProfileTab; label: string }[] = [
    { key: "about", label: "About" },
    { key: "posts", label: "Posts" },
    { key: "drafts", label: "Drafts" },
    { key: "reviews", label: "Reviews" }
  ];

  const rightBtnLabel = tab === "reviews" ? "Add Review" : "Add New Post";

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* ── Cover + Avatar ── */}
      <div className="relative w-full">
        {/* Cover image */}
        <div className="w-full h-36 md:h-52 overflow-hidden">
          <img
            src={coverSrc}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        </div>

        <button
          onClick={() => coverRef.current?.click()}
          // Changed positioning to top-3 right-3 for mobile, and md:top-auto md:bottom-3 for desktop
          className="absolute top-3 md:top-auto md:bottom-3 right-3 z-10 flex items-center gap-1.5
    bg-black/60 hover:bg-[#0072D1] text-white text-xs font-bold
    px-3 py-1.5 rounded-xl transition-colors shadow-lg backdrop-blur-sm"
        >
          <Camera className="w-3.5 h-3.5" /> Edit Cover
        </button>

        {/* Hidden file input for cover */}
        <input
          ref={coverRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleCoverChange}
        />

        {/* Avatar */}
        <div className="absolute left-6 md:left-8 -bottom-12 md:-bottom-16">
          <div className="relative">
            <div
              className="w-24 h-24 md:w-36 md:h-36 rounded-[22px] md:rounded-[28px]
              border-4 border-[#0072D1] bg-white shadow-xl overflow-hidden"
            >
              {profileImageSrc && (
                <img
                  src={profileImageSrc}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <button
              onClick={() => profileImageRef.current?.click()}
              className="absolute bottom-0 right-0 flex items-center justify-center w-9 h-9 md:w-11 md:h-11
              bg-[#0072D1] hover:bg-black text-white rounded-full shadow-lg transition-colors"
              title="Edit profile image"
            >
              <Camera className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        </div>

        {/* Hidden file input for profile image */}
        <input
          ref={profileImageRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleProfileImageChange}
        />
      </div>

      {/* ── DESKTOP layout ── */}
      <div className="hidden md:flex gap-6 max-w-7xl mx-auto px-6 mt-20 pb-12">
        {/* LEFT sidebar */}
        <aside className="w-64 flex-shrink-0">
          <div className="text-center mb-5">
            <h2 className="text-xl font-black text-gray-900">Full Name</h2>
            <p className="text-lg font-black text-gray-900">Plumber</p>
          </div>
          <AboutPanel />
        </aside>

        {/* RIGHT content */}
        <div className="flex-1 min-w-0">
          {/* Tab bar + buttons */}
          <div className="flex items-center justify-between border-b border-gray-200 mb-6">
            <div className="flex">
              {/* Desktop shows Posts / Drafts / Reviews only (About is always in sidebar) */}
              {TABS.filter((t) => t.key !== "about").map((t) => (
                <button
                  key={t.key}
                  onClick={() => {
                    setTab(t.key);
                    setPage(1);
                  }}
                  className={`px-5 py-3 text-sm font-bold border-b-2 transition-all
                    ${
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
              <button
                className="relative overflow-hidden flex items-center gap-1.5 bg-[#0072D1] text-white text-xs
                font-bold px-4 py-2.5 rounded-xl transition-all duration-300 hover:bg-black hover:scale-105 group"
              >
                <Pencil className="w-3.5 h-3.5 relative z-10" />
                <span className="relative z-10">Edit Profile</span>
                <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </button>
              <button
                onClick={() => {
                  if (tab === "reviews") setShowReviewModal(true);
                }}
                className="relative overflow-hidden flex items-center gap-1.5 bg-black text-white text-xs
                font-bold px-4 py-2.5 rounded-xl transition-all duration-300 hover:bg-[#0072D1] hover:scale-105 group"
              >
                <Plus className="w-3.5 h-3.5 relative z-10" />
                <span className="relative z-10">{rightBtnLabel}</span>
                <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </button>
            </div>
          </div>

          {/* Posts */}
          {(tab === "posts" || tab === "about") && (
            <>
              <div className="grid grid-cols-2 gap-5">
                {POSTS.map((p) => (
                  <PostCard
                    key={p.id}
                    post={p}
                    onViewDetails={setSelectedPost}
                  />
                ))}
              </div>
              <Pagination current={page} total={3} onChange={setPage} />
            </>
          )}

          {/* Drafts */}
          {tab === "drafts" && (
            <>
              <div className="grid grid-cols-2 gap-5">
                {DRAFTS.slice(0, 2).map((p) => (
                  <PostCard
                    key={p.id}
                    post={p}
                    onViewDetails={setSelectedPost}
                  />
                ))}
              </div>
              <Pagination current={page} total={3} onChange={setPage} />
            </>
          )}

          {/* Reviews */}
          {tab === "reviews" && (
            <>
              <button
                onClick={() => setShowReviewModal(true)}
                className="relative overflow-hidden w-full flex items-center justify-center gap-2 bg-black text-white
                  font-bold py-3.5 rounded-xl transition-all duration-300 hover:bg-[#0072D1] hover:scale-[1.01] group text-sm mb-5 shadow-sm"
              >
                <Plus className="w-4 h-4 relative z-10" />
                <span className="relative z-10">Add Review</span>
                <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </button>
              <div className="grid grid-cols-2 gap-5">
                {REVIEWS.map((r) => (
                  <ReviewCard key={r.id} review={r} />
                ))}
              </div>
              <Pagination current={page} total={3} onChange={setPage} />
            </>
          )}
        </div>
      </div>

      {/* ── MOBILE layout ── */}
      <div className="md:hidden">
        {/* Name + Edit Profile */}
        <div className="flex flex-col items-center pt-14 pb-3 px-4">
          <h2 className="text-base font-black text-gray-900">
            Full Name <span className="font-black">(Plumber)</span>
          </h2>
          <button
            className="relative overflow-hidden mt-2 flex items-center gap-1.5 bg-[#0072D1] text-white
            text-xs font-bold px-4 py-2 rounded-xl transition-all duration-300 hover:bg-black hover:scale-105 group"
          >
            <Pencil className="w-3 h-3 relative z-10" />
            <span className="relative z-10">Edit Profile</span>
            <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </button>
        </div>

        {/* Mobile tabs — About / Posts / Drafts / Reviews */}
        <div className="flex border-b border-gray-200">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => {
                setTab(t.key);
                setPage(1);
              }}
              className={`flex-1 py-3 text-xs font-bold border-b-2 transition-all
                ${
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
          {/* About tab */}
          {tab === "about" && <AboutPanel />}

          {/* Posts tab */}
          {tab === "posts" && (
            <>
              <button
                className="relative overflow-hidden w-full flex items-center justify-center gap-2 bg-black text-white
                font-bold py-3.5 rounded-xl transition-all duration-300 hover:bg-[#0072D1] hover:scale-[1.01] group text-sm shadow-sm"
              >
                <Plus className="w-4 h-4 relative z-10" />
                <span className="relative z-10">Add New Post</span>
                <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </button>
              {POSTS.map((p) => (
                <PostCard key={p.id} post={p} onViewDetails={setSelectedPost} />
              ))}
              <Pagination current={page} total={3} onChange={setPage} />
            </>
          )}

          {/* Drafts tab */}
          {tab === "drafts" && (
            <>
              <button
                className="relative overflow-hidden w-full flex items-center justify-center gap-2 bg-black text-white
                font-bold py-3.5 rounded-xl transition-all duration-300 hover:bg-[#0072D1] hover:scale-[1.01] group text-sm shadow-sm"
              >
                <Plus className="w-4 h-4 relative z-10" />
                <span className="relative z-10">Add New Post</span>
                <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </button>
              {DRAFTS.map((p) => (
                <PostCard key={p.id} post={p} onViewDetails={setSelectedPost} />
              ))}
              <Pagination current={page} total={3} onChange={setPage} />
            </>
          )}

          {/* Reviews tab */}
          {tab === "reviews" && (
            <>
              <button
                onClick={() => setShowReviewModal(true)}
                className="relative overflow-hidden w-full flex items-center justify-center gap-2 bg-black text-white
                  font-bold py-3.5 rounded-xl transition-all duration-300 hover:bg-[#0072D1] hover:scale-[1.01] group text-sm shadow-sm"
              >
                <Plus className="w-4 h-4 relative z-10" />
                <span className="relative z-10">Add Review</span>
                <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </button>
              {REVIEWS.map((r) => (
                <ReviewCard key={r.id} review={r} />
              ))}
              <Pagination current={page} total={3} onChange={setPage} />
            </>
          )}
        </div>
        {/* end mobile tab content */}
      </div>
      {/* end mobile layout */}

      {/* ── Full Details Modal ── */}
      {selectedPost && (
        <FullDetailsModal
          card={selectedPost}
          onClose={() => setSelectedPost(null)}
        />
      )}

      {/* ── Add Review Modal ── */}
      {showReviewModal && (
        <AddReviewModal onClose={() => setShowReviewModal(false)} />
      )}
    </div>
  );
};

export default UserProfile;
