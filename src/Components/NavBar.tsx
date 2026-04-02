import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  User,
  Edit3,
  LogOut,
  Plus,
  Eye,
  Shield,
  Bell,
  CheckCheck,
  CircleCheck,
  BadgeX,
  MessageSquare,
  MessageSquareWarning,
  CalendarCheck,
  BookUp,
  X,
  Menu,
  ChevronRight,
  ChevronDown,
  Calendar,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import MessagingUI from "./MessagingUI";
import BookingCalendar from "./BookingCalendar";
import { notificationService, type AppNotification } from "../services/notificationService";
import { searchService, type SearchResult } from "../services/searchService";
import { bookingService, type Booking } from "../services/bookingService";

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMessagingOpen, setIsMessagingOpen] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [calendarBookings, setCalendarBookings] = useState<Booking[]>([]);
  const [showAllNotifications, setShowAllNotifications] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<number | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, userProfile, userRole, signOut } = useAuth();

  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const notifBtnRef = useRef<HTMLButtonElement>(null);
  const mobileNotifDrawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!currentUser?.uid) {
      setNotifications([]);
      return;
    }
    const unsub = notificationService.subscribeToNotifications(currentUser.uid, (notifs) =>
      setNotifications(notifs)
    );
    return () => unsub();
  }, [currentUser?.uid]);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const latestNotifications = notifications.slice(0, 10);
  const olderNotifications = notifications.slice(10);

  useEffect(() => {
    if (!isNotifOpen) {
      setShowAllNotifications(false);
    }
  }, [isNotifOpen]);

  // Subscribe to bookings when calendar is opened
  useEffect(() => {
    if (!isCalendarModalOpen || !currentUser?.uid) {
      setCalendarBookings([]);
      return;
    }

    // Get bookings for the current user (both as customer and provider)
    let unsub: (() => void) | null = null;

    if (userRole === "service_provider") {
      // If service provider, show their incoming bookings
      unsub = bookingService.subscribeToProviderBookings(
        currentUser.uid,
        (bookings) => setCalendarBookings(bookings)
      );
    } else {
      // Otherwise show their bookings as customer
      unsub = bookingService.subscribeToCustomerBookings(
        currentUser.uid,
        (bookings) => setCalendarBookings(bookings)
      );
    }

    return () => {
      if (unsub) unsub();
    };
  }, [isCalendarModalOpen, currentUser?.uid, userRole]);

  const handleMarkAllRead = useCallback(async () => {
    if (!currentUser?.uid) return;
    try {
      await notificationService.markAllAsRead(currentUser.uid);
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  }, [currentUser?.uid]);

  const handleNotifItemClick = useCallback(async (notif: AppNotification) => {
    if (notif.read === false) {
      try {
        await notificationService.markAsRead(notif.id);
      } catch (err) {
        console.error("Failed to mark as read:", err);
      }
    }

    // Close the notification drawer first
    setIsNotifOpen(false);

    // Small delay to ensure the drawer closes before navigation
    setTimeout(() => {
      if (notif.type === "new_message" && notif.conversationId) {
        setSelectedConversationId(notif.conversationId);
        setIsMessagingOpen(true);
        return;
      }

      if (notif.type === "post_approved" || notif.type === "post_declined") {
        navigate("/profile");
        return;
      }

      if (notif.type === "booking_approved" || notif.type === "booking_declined" || notif.type === "booking_request" || notif.type === "booking_cancelled") {
        navigate("/bookings");
        return;
      }

      // Default fallback
      navigate("/profile");
    }, 150);
  }, [navigate]);

  // Handle click outside for desktop notifications
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        notifRef.current &&
        !notifRef.current.contains(e.target as Node) &&
        notifBtnRef.current &&
        !notifBtnRef.current.contains(e.target as Node)
      ) {
        setIsNotifOpen(false);
      }
    };

    if (isNotifOpen) {
      document.addEventListener("mousedown", handler);
    }

    return () => document.removeEventListener("mousedown", handler);
  }, [isNotifOpen]);

  // Handle outside-click/touch for mobile notification drawer using a single
  // pointerdown listener. Using pointerdown (instead of mousedown/touchstart)
  // on the *capture* phase lets us reliably detect outside taps while the
  // drawer's own onPointerDown stopPropagation prevents false-positive closes
  // when the user interacts with items inside the drawer.
  useEffect(() => {
    const handlePointerOutside = (e: PointerEvent) => {
      if (
        mobileNotifDrawerRef.current &&
        !mobileNotifDrawerRef.current.contains(e.target as Node)
      ) {
        setIsNotifOpen(false);
      }
    };

    if (isNotifOpen && window.innerWidth < 1024) {
      // Use capture phase so we receive the event before any child handler,
      // and a small delay so the bell-button's own toggle click doesn't
      // immediately re-trigger this listener on mount.
      const timer = window.setTimeout(() => {
        document.addEventListener("pointerdown", handlePointerOutside, true);
      }, 100);
      return () => {
        window.clearTimeout(timer);
        document.removeEventListener("pointerdown", handlePointerOutside, true);
      };
    }

    return () => {
      document.removeEventListener("pointerdown", handlePointerOutside, true);
    };
  }, [isNotifOpen]);

  useEffect(() => {
    const closeSuggestions = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSuggestionOpen(false);
      }
    };

    if (isSuggestionOpen) {
      document.addEventListener("mousedown", closeSuggestions);
    }
    return () => {
      document.removeEventListener("mousedown", closeSuggestions);
    };
  }, [isSuggestionOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        profileButtonRef.current &&
        !profileButtonRef.current.contains(event.target as Node)
      ) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  // Prevent body scroll when notification drawer is open on mobile
  useEffect(() => {
    if (isNotifOpen && window.innerWidth < 1024) {
      document.body.style.overflow = "hidden";
    } else if (!isNotifOpen && window.innerWidth >= 1024) {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isNotifOpen]);

  const handleLogout = async () => {
    try {
      await signOut();
      setIsProfileDropdownOpen(false);
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const getDisplayName = () => {
    if (userProfile?.firstName || (userProfile as any)?.lastName) {
      const firstName = userProfile?.firstName || "";
      const lastName = (userProfile as any)?.lastName || "";
      const fullName = `${firstName} ${lastName}`.trim();
      if (fullName) return fullName;
    }
    if (userProfile?.displayName) return userProfile.displayName;
    if (currentUser?.displayName) return currentUser.displayName;
    return "User";
  };

  const getUsername = () => {
    return currentUser?.email || "";
  };

  const getProfileImageUrl = (): string | null => {
    if (userProfile) {
      const profile = userProfile as any;
      if (profile.photoURL && typeof profile.photoURL === "string" && profile.photoURL.trim() !== "") {
        return profile.photoURL;
      }
      if (profile.profileImage && typeof profile.profileImage === "string" && profile.profileImage.trim() !== "") {
        return profile.profileImage;
      }
      if (
        profile.profileImageUrl &&
        typeof profile.profileImageUrl === "string" &&
        profile.profileImageUrl.trim() !== ""
      ) {
        return profile.profileImageUrl;
      }
      if (profile.profilePhoto && typeof profile.profilePhoto === "string" && profile.profilePhoto.trim() !== "") {
        return profile.profilePhoto;
      }
      if (profile.avatar && typeof profile.avatar === "string" && profile.avatar.trim() !== "") {
        return profile.avatar;
      }
      if (profile.avatarUrl && typeof profile.avatarUrl === "string" && profile.avatarUrl.trim() !== "") {
        return profile.avatarUrl;
      }
      if (profile.imageUrl && typeof profile.imageUrl === "string" && profile.imageUrl.trim() !== "") {
        return profile.imageUrl;
      }
      if (profile.image && typeof profile.image === "string" && profile.image.trim() !== "") {
        return profile.image;
      }
    }

    if (currentUser?.photoURL && typeof currentUser.photoURL === "string" && currentUser.photoURL.trim() !== "") {
      return currentUser.photoURL;
    }

    return null;
  };

  const profileImageUrl = getProfileImageUrl();

  const ProfileAvatar: React.FC<{ size?: "sm" | "md" | "lg"; className?: string }> = ({
    size = "md",
    className = "",
  }) => {
    const sizeClasses = {
      sm: "w-9 h-9",
      md: "w-10 h-10",
      lg: "w-14 h-14",
    };
    const iconSizes = {
      sm: "w-4 h-4",
      md: "w-5 h-5",
      lg: "w-7 h-7",
    };

    const [imgError, setImgError] = useState(false);

    return (
      <div
        className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center overflow-hidden flex-shrink-0 ${className}`}
      >
        {profileImageUrl && !imgError ? (
          <img
            src={profileImageUrl}
            alt="Profile"
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
          />
        ) : (
          <User className={`${iconSizes[size]} text-gray-500`} />
        )}
      </div>
    );
  };

  const handleNavigation = (sectionId: string) => {
    const el = document.getElementById(sectionId);

    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
  };

  const navigateToSearch = (searchTerm: string, route?: string) => {
    const query = searchTerm.trim();
    if (!query) return;
    setIsSuggestionOpen(false);
    setSearchQuery(query);

    if (route && route.startsWith("/")) {
      navigate(route);
      return;
    }

    navigate(`/browseplace?q=${encodeURIComponent(query)}`);
  };

  const clearSearchBar = () => {
    setSearchQuery("");
    setSuggestions([]);
    setIsSuggestionOpen(false);
    setSearchError(null);
  };

  const fetchSearchSuggestions = async (query: string) => {
    const q = query.trim();
    if (q.length < 2) {
      setSuggestions([]);
      setIsSuggestionOpen(false);
      setSearchError(null);
      return;
    }

    setIsSuggestionsLoading(true);
    setSearchError(null);

    try {
      const results = await searchService.search(q, 7);
      setSuggestions(results);
      setIsSuggestionOpen(results.length > 0);
      if (results.length === 0) {
        setSearchError(null);
      }
    } catch (err) {
      console.error("Error fetching search suggestions:", err);
      setSearchError("Failed to load suggestions. Please try again.");
      setSuggestions([]);
      setIsSuggestionOpen(false);
    } finally {
      setIsSuggestionsLoading(false);
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setIsSuggestionOpen(!!value.trim());

    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = window.setTimeout(() => {
      fetchSearchSuggestions(value);
    }, 250);
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!searchQuery.trim()) return;
    navigateToSearch(searchQuery);
  };

  const getDropdownLinks = () => {
    const baseLink = {
      findService: {
        label: "Find Service",
        icon: Search,
        path: "/browseplace",
      },
      logout: {
        label: "Logout",
        icon: LogOut,
        action: handleLogout,
      },
    };

    const roleLinks: Record<
      string,
      Array<{ label: string; icon: React.FC<any>; path?: string; action?: () => void }>
    > = {
      seeker: [baseLink.findService, baseLink.logout],
      service_provider: [
        {
          label: "Profile",
          icon: User,
          path: "/profile",
        },
        baseLink.findService,
        {
          label: "Add Post",
          icon: Plus,
          path: "/add-post",
        },
        {
          label: "Pending Posts",
          icon: Eye,
          path: "/profile",
        },
        baseLink.logout,
      ],
      admin: [
        {
          label: "Profile",
          icon: User,
          path: "/profile",
        },
        baseLink.findService,
        {
          label: "Add Post",
          icon: Plus,
          path: "/add-post",
        },
        {
          label: "Admin Dashboard",
          icon: Shield,
          path: "/admin/dashboard",
        },
        baseLink.logout,
      ],
    };

    return roleLinks[userRole || "seeker"] || [baseLink.findService, baseLink.logout];
  };

  const getNotifIcon = (type: string) => {
    if (type === "post_approved") return <CircleCheck className="w-4 h-4 text-green-600" />;
    if (type === "booking_approved") return <CalendarCheck className="w-4 h-4 text-green-600" />;
    if (type === "booking_request") return <BookUp className="w-4 h-4 text-purple-600" />;
    if (type === "new_message") return <MessageSquareWarning className="w-4 h-4 text-blue-600" />;
    if (type === "post_declined" || type === "booking_declined") return <BadgeX className="w-4 h-4 text-red-500" />;
    return <BadgeX className="w-4 h-4 text-red-500" />;
  };

  const getNotifIconBg = (type: string) => {
    if (type === "post_approved" || type === "booking_approved") return "bg-green-100";
    if (type === "booking_request") return "bg-purple-100";
    if (type === "new_message") return "bg-blue-100";
    if (type === "post_declined" || type === "booking_declined") return "bg-red-100";
    return "bg-red-100";
  };

  const getNotifActionLabel = (type: string) => {
    if (type === "new_message") return "Open conversation";
    if (type === "booking_request") return "View booking";
    if (type === "post_approved" || type === "booking_approved") return "View details";
    if (type === "post_declined" || type === "booking_declined") return "View details";
    return "View details";
  };

  const getNotifActionIcon = (type: string) => {
    if (type === "new_message") return <MessageSquareWarning className="w-3 h-3" />;
    if (type === "booking_request") return <BookUp className="w-3 h-3" />;
    return <ChevronRight className="w-3 h-3" />;
  };

  const renderSearchSuggestions = () => {
    if (!isSuggestionOpen) return null;
    return (
      <div className="absolute z-[60] w-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
        {isSuggestionsLoading ? (
          <div className="px-4 py-3 text-sm text-gray-500 flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-[#0072D1] border-t-transparent rounded-full animate-spin" />
            Loading suggestions...
          </div>
        ) : searchError ? (
          <div className="px-4 py-3 text-sm text-red-500">{searchError}</div>
        ) : suggestions.length > 0 ? (
          <div className="max-h-[24rem] overflow-y-auto transition-all duration-300">
            {suggestions.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  navigateToSearch(item.title, item.route);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent transition-all duration-200 flex items-center gap-3 group ${
                  idx !== suggestions.length - 1 ? "border-b border-gray-50" : ""
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-[#0072D1]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#0072D1]/20 transition-colors">
                  <Search className="w-3.5 h-3.5 text-[#0072D1]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 text-sm truncate">{item.title}</div>
                  <div className="text-xs text-gray-500 truncate mt-0.5">
                    {item.subtitle || item.meta || ""}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#0072D1] transition-colors flex-shrink-0" />
              </button>
            ))}
          </div>
        ) : (
          <div className="px-4 py-3 text-sm text-gray-500">No suggestions found. Press Enter to search.</div>
        )}
      </div>
    );
  };

  const renderNotifItem = (
    notif: AppNotification,
    isLast: boolean,
    horizontalPadding: string
  ) => (
    <button
      key={notif.id}
      type="button"
      onPointerDown={(e) => {
        // Prevent the event from reaching the document-level capture listener
        // that closes the drawer. Without this, a tap on a notification item
        // would close the drawer before onClick/handleNotifItemClick fires.
        e.stopPropagation();
      }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleNotifItemClick(notif);
      }}
      className={`w-full text-left ${horizontalPadding} py-3.5 transition-all duration-200 hover:bg-gray-50/80 active:bg-gray-100 flex items-start gap-3.5 group border-none outline-none cursor-pointer bg-transparent ${
        !notif.read ? "bg-gradient-to-r from-[#0072D1]/[0.04] to-transparent" : ""
      }`}
      style={{
        borderBottom: !isLast ? "1px solid rgba(0,0,0,0.04)" : "none",
        // Guarantee 44×44 px minimum touch target (WCAG 2.5.5 / Apple HIG)
        minHeight: "44px",
        // Prevent the 300ms tap delay and double-tap zoom on interactive elements
        touchAction: "manipulation",
      }}
      aria-label={`${notif.title}. ${getNotifActionLabel(notif.type)}`}
    >
      <div
        className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center mt-0.5 transition-transform group-hover:scale-110 ${getNotifIconBg(
          notif.type
        )}`}
      >
        {getNotifIcon(notif.type)}
      </div>

      <div className="flex-1 min-w-0">
        <p className={`text-[13px] font-semibold leading-snug ${!notif.read ? "text-gray-900" : "text-gray-600"}`}>
          {notif.title}
        </p>

        <p className="text-[12px] text-gray-500 mt-1 leading-relaxed line-clamp-2">
          {notif.message}
        </p>

        <div className="flex items-center justify-between gap-3 mt-2">
          <p className="text-[10px] text-gray-400 font-medium">
            {notif.createdAt.toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>

          <span
            className={`inline-flex items-center gap-1 text-[10px] font-bold whitespace-nowrap transition-colors ${
              notif.type === "new_message"
                ? "text-blue-500 group-hover:text-blue-700"
                : notif.type === "booking_request"
                ? "text-purple-500 group-hover:text-purple-700"
                : notif.type === "post_approved" || notif.type === "booking_approved"
                ? "text-green-500 group-hover:text-green-700"
                : "text-red-400 group-hover:text-red-600"
            }`}
          >
            {getNotifActionIcon(notif.type)}
            {getNotifActionLabel(notif.type)}
          </span>
        </div>
      </div>

      {!notif.read && (
        <span className="flex-shrink-0 w-2.5 h-2.5 rounded-full bg-[#FF5A00] mt-2 shadow-sm shadow-[#FF5A00]/30" />
      )}
    </button>
  );

  const renderNotificationContent = (isMobile = false) => {
    const horizontalPadding = isMobile ? "px-4" : "px-5";

    return (
      <>
        <div
          className={`flex items-center justify-between ${
            isMobile ? "px-4 py-3" : "px-5 py-3.5"
          } bg-gradient-to-r from-gray-900 to-gray-800`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`${
                isMobile ? "w-6 h-6" : "w-7 h-7"
              } rounded-full bg-white/10 flex items-center justify-center`}
            >
              <Bell className={`${isMobile ? "w-3 h-3" : "w-3.5 h-3.5"} text-white`} />
            </div>
            <span className="text-white text-sm font-bold tracking-wide">Notifications</span>
            {unreadCount > 0 && (
              <span className="bg-[#FF5A00] text-white text-[10px] font-black px-2 py-0.5 rounded-full min-w-[20px] text-center">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onPointerDown={(e) => {
                  // Guard against the capture-phase document listener
                  e.stopPropagation();
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleMarkAllRead();
                }}
                className={`flex items-center gap-1.5 text-[11px] text-gray-400 hover:text-white transition-colors font-medium bg-transparent border-none outline-none cursor-pointer rounded-lg ${
                  isMobile ? "" : "px-2 py-1 hover:bg-white/10"
                }`}
                style={{ minHeight: "44px", touchAction: "manipulation" }}
              >
                <CheckCheck className="w-3.5 h-3.5" />
                {isMobile ? "Read all" : "Mark all read"}
              </button>
            )}

            {isMobile && (
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsNotifOpen(false);
                }}
                className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors bg-transparent border-none outline-none cursor-pointer"
                style={{ minWidth: "44px", minHeight: "44px", touchAction: "manipulation" }}
              >
                <X className="w-3.5 h-3.5 text-gray-400" />
              </button>
            )}
          </div>
        </div>

        <div
          className={`${
            isMobile ? "max-h-[60vh]" : "max-h-[24rem]"
          } overflow-y-auto overscroll-contain notif-scrollbar`}
        >
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-gray-400">
              <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                <Bell className="w-7 h-7 text-gray-200" />
              </div>
              <p className="text-sm font-semibold text-gray-400">No notifications yet</p>
              <p className="text-xs text-gray-300 mt-1">We'll let you know when something arrives</p>
            </div>
          ) : (
            <>
              {latestNotifications.map((notif, idx) =>
                renderNotifItem(
                  notif,
                  olderNotifications.length === 0 && idx === latestNotifications.length - 1,
                  horizontalPadding
                )
              )}

              {olderNotifications.length > 0 && !showAllNotifications && (
                <div className="border-t border-gray-100">
                  <button
                    type="button"
                    onPointerDown={(e) => {
                      // Prevent capture-phase document listener from closing
                      // the drawer before this button's onClick fires.
                      e.stopPropagation();
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowAllNotifications(true);
                    }}
                    className={`w-full flex items-center justify-center gap-2 ${horizontalPadding} py-3 text-xs font-bold text-[#0072D1] hover:bg-[#0072D1]/5 transition-all duration-200 bg-transparent border-none outline-none cursor-pointer group`}
                    style={{ minHeight: "44px", touchAction: "manipulation" }}
                  >
                    <span>
                      Show {olderNotifications.length} older notification
                      {olderNotifications.length !== 1 ? "s" : ""}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
                  </button>
                </div>
              )}

              {olderNotifications.length > 0 && showAllNotifications && (
                <div className="animate-[olderNotifsReveal_0.3s_ease-out]">
                  <div
                    className={`flex items-center gap-2 ${horizontalPadding} py-2 bg-gray-50 border-t border-b border-gray-100`}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      Older
                    </span>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>

                  {olderNotifications.map((notif, idx) =>
                    renderNotifItem(notif, idx === olderNotifications.length - 1, horizontalPadding)
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </>
    );
  };

  return (
    <>
      <style>{`
        @keyframes notifSlideIn { 
          from { opacity: 0; transform: translateY(-8px) scale(0.97); } 
          to { opacity: 1; transform: translateY(0) scale(1); } 
        } 
        @keyframes olderNotifsReveal { 
          from { opacity: 0; transform: translateY(10px); } 
          to { opacity: 1; transform: translateY(0); } 
        } 
        @keyframes drawerSlideIn { 
          from { transform: translateX(100%); } 
          to { transform: translateX(0); } 
        } 
        @keyframes drawerSlideInBottom { 
          from { transform: translateY(100%); } 
          to { transform: translateY(0); } 
        } 
        @keyframes overlayFadeIn { 
          from { opacity: 0; } 
          to { opacity: 1; } 
        } 
        @keyframes menuItemSlideIn { 
          from { opacity: 0; transform: translateX(16px); } 
          to { opacity: 1; transform: translateX(0); } 
        } 
        .drawer-slide-in { 
          animation: drawerSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; 
        } 
        .drawer-slide-in-bottom { 
          animation: drawerSlideInBottom 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; 
        } 
        .overlay-fade-in { 
          animation: overlayFadeIn 0.25s ease-out forwards; 
        } 
        .menu-item-slide { 
          animation: menuItemSlideIn 0.3s ease-out forwards; 
          opacity: 0; 
        } 
        .notif-scrollbar::-webkit-scrollbar { 
          width: 4px; 
        } 
        .notif-scrollbar::-webkit-scrollbar-track { 
          background: transparent; 
        } 
        .notif-scrollbar::-webkit-scrollbar-thumb { 
          background: #d1d5db; 
          border-radius: 4px; 
        } 
        .notif-scrollbar::-webkit-scrollbar-thumb:hover { 
          background: #9ca3af; 
        } 
      `}</style>

      <nav className="w-full bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100/80 sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => handleNavigation("home")}
              className="flex-shrink-0 flex items-center cursor-pointer bg-transparent border-none outline-none hover:opacity-80 transition-opacity"
            >
              <h1 className="text-2xl font-rostex font-bold tracking-widest flex items-center">
                <span className="text-[#0072D1]">FIXIT</span>
                <span className="text-[#FF5A00]">NOW</span>
              </h1>
            </button>

            <div className="hidden lg:flex flex-1 max-w-sm mx-6" ref={searchContainerRef}>
              <form className="relative w-full" onSubmit={handleSearchSubmit}>
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-[#0072D1]" />
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search services, categories, cities..."
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  className="block w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50/80 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0072D1]/20 focus:border-[#0072D1] focus:bg-white transition-all duration-200"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={clearSearchBar}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center bg-transparent border-none outline-none cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600 transition-colors" />
                  </button>
                )}
                {renderSearchSuggestions()}
              </form>
            </div>

            <div className="hidden lg:flex items-center gap-2">
              <div className="flex gap-1 mr-2">
                {["home", "about", "contact"].map((section) => (
                  <button
                    key={section}
                    className="font-semibold text-sm px-3 py-2 rounded-lg text-gray-600 hover:text-[#0072D1] hover:bg-[#0072D1]/5 transition-all duration-200 bg-transparent border-none outline-none cursor-pointer capitalize"
                    onClick={() => handleNavigation(section)}
                  >
                    {section.charAt(0).toUpperCase() + section.slice(1)}
                  </button>
                ))}
              </div>

              <div className="w-px h-8 bg-gray-200 mx-1" />

              <div className="flex items-center gap-2">
                <button
                  className="relative overflow-hidden flex items-center gap-1.5 bg-[#FF5A00] text-white px-4 py-2 rounded-lg font-semibold text-sm shadow-sm transition-all duration-300 hover:bg-[#e04e00] hover:shadow-md hover:shadow-[#FF5A00]/20 active:scale-95 group"
                  onClick={() => navigate("/browseplace")}
                >
                  <Search className="w-4 h-4" />
                  <span className="relative z-10">Find Service</span>
                  <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </button>

                {currentUser && (
                  <button
                    className="relative overflow-hidden flex items-center gap-1.5 bg-[#0072D1] text-white px-4 py-2 rounded-lg font-semibold text-sm shadow-sm transition-all duration-300 hover:bg-[#005baa] hover:shadow-md hover:shadow-[#0072D1]/20 active:scale-95 group"
                    onClick={() => navigate("/bookings")}
                  >
                    <Bell className="w-4 h-4" />
                    <span className="relative z-10">Bookings</span>
                    <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  </button>
                )}

                

                {(userRole === "service_provider" || userRole === "admin") && (
                  <button
                    className="relative overflow-hidden flex items-center gap-1.5 bg-[#0072D1] text-white px-4 py-2 rounded-lg font-semibold text-sm shadow-sm transition-all duration-300 hover:bg-[#005baa] hover:shadow-md hover:shadow-[#0072D1]/20 active:scale-95 group"
                    onClick={() => navigate("/add-post")}
                  >
                    <Plus className="w-4 h-4" />
                    <span className="relative z-10">Add Post</span>
                    <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  </button>
                )}

                {currentUser && (
                  <button
                    onClick={() => setIsCalendarModalOpen(true)}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-[#0072D1]/10 hover:text-[#0072D1] transition-all duration-200 active:scale-95 group"
                    aria-label="Calendar"
                  >
                    <Calendar className="w-[18px] h-[18px] text-gray-500 group-hover:text-[#0072D1] transition-colors" />
                  </button>
                )}

                {currentUser && (
                  <button
                    onClick={() => setIsMessagingOpen(true)}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-[#0072D1]/10 hover:text-[#0072D1] transition-all duration-200 active:scale-95 group"
                    aria-label="Messages"
                  >
                    <MessageSquare className="w-[18px] h-[18px] text-gray-500 group-hover:text-[#0072D1] transition-colors" />
                  </button>
                )}

                {currentUser && (
                  <div className="relative">
                    <button
                      ref={notifBtnRef}
                      onClick={() => setIsNotifOpen((o) => !o)}
                      className={`relative w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 active:scale-95 group ${
                        isNotifOpen ? "bg-[#0072D1]/10 text-[#0072D1]" : "bg-gray-100 hover:bg-[#0072D1]/10"
                      }`}
                      aria-label="Notifications"
                    >
                      <Bell
                        className={`w-[18px] h-[18px] transition-colors ${
                          isNotifOpen ? "text-[#0072D1]" : "text-gray-500 group-hover:text-[#0072D1]"
                        }`}
                      />
                      {unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-[#FF5A00] text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 leading-none shadow-sm shadow-[#FF5A00]/30 animate-pulse">
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                      )}
                    </button>

                    {isNotifOpen && (
                      <div
                        ref={notifRef}
                        className="absolute right-0 mt-3 w-[22rem] bg-white rounded-2xl shadow-2xl border border-gray-100/80 z-50 overflow-hidden"
                        style={{ animation: "notifSlideIn 0.2s ease-out" }}
                      >
                        {renderNotificationContent(false)}
                      </div>
                    )}
                  </div>
                )}

                {currentUser ? (
                  <div className="relative" ref={dropdownRef}>
                    <button
                      ref={profileButtonRef}
                      onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                      className={`flex items-center justify-center bg-transparent border-2 rounded-full outline-none cursor-pointer transition-all duration-200 active:scale-95 ${
                        isProfileDropdownOpen
                          ? "border-[#0072D1] shadow-md shadow-[#0072D1]/10"
                          : "border-transparent hover:border-gray-200"
                      }`}
                      aria-label="Toggle profile menu"
                    >
                      <ProfileAvatar size="md" />
                    </button>

                    {isProfileDropdownOpen && (
                      <div
                        className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100/80 z-50 overflow-hidden"
                        style={{ animation: "notifSlideIn 0.2s ease-out" }}
                      >
                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 px-5 py-5">
                          <div className="flex items-start gap-3.5">
                            <ProfileAvatar size="lg" className="ring-2 ring-white/20 rounded-2xl" />

                            <div className="flex-1 min-w-0">
                              <h3 className="text-white font-bold text-sm truncate">{getDisplayName()}</h3>
                              <p className="text-gray-400 text-xs truncate mt-0.5">{getUsername()}</p>
                              {userRole && (
                                <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wider text-[#FF5A00] bg-[#FF5A00]/10 px-2 py-0.5 rounded-full">
                                  {userRole === "service_provider" ? "Provider" : userRole}
                                </span>
                              )}
                              {userRole === "service_provider" && (
                                <button
                                  onClick={() => {
                                    navigate("/edit-profile");
                                    setIsProfileDropdownOpen(false);
                                  }}
                                  className="mt-2.5 inline-flex items-center gap-1.5 bg-[#0072D1] hover:bg-[#005baa] text-white text-xs px-3 py-1.5 rounded-lg transition-colors font-medium border-none outline-none cursor-pointer"
                                >
                                  <Edit3 className="w-3 h-3" />
                                  Edit Profile
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="py-1.5">
                          {getDropdownLinks().map((link, index) => {
                            const IconComponent = link.icon;
                            const isLogout = link.label === "Logout";
                            return (
                              <button
                                key={index}
                                onClick={() => {
                                  if (link.path) {
                                    navigate(link.path);
                                  } else if (link.action) {
                                    link.action();
                                  }
                                  setIsProfileDropdownOpen(false);
                                }}
                                className={`w-full text-left px-5 py-2.5 text-sm transition-all duration-200 flex items-center gap-3 bg-transparent border-none outline-none cursor-pointer group ${
                                  isLogout
                                    ? "text-red-500 hover:bg-red-50"
                                    : "text-gray-700 hover:bg-gray-50 hover:text-[#0072D1]"
                                }`}
                              >
                                <div
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                                    isLogout
                                      ? "bg-red-50 group-hover:bg-red-100"
                                      : "bg-gray-100 group-hover:bg-[#0072D1]/10"
                                  }`}
                                >
                                  <IconComponent
                                    className={`w-4 h-4 flex-shrink-0 ${
                                      isLogout
                                        ? "text-red-500"
                                        : "text-gray-500 group-hover:text-[#0072D1]"
                                    }`}
                                  />
                                </div>
                                <span className="font-medium">{link.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    className="relative overflow-hidden bg-gray-900 text-white px-5 py-2 rounded-lg font-semibold text-sm shadow-sm transition-all duration-300 hover:bg-[#0072D1] hover:shadow-md active:scale-95 group"
                    onClick={() => navigate("/selectrole")}
                  >
                    <span className="relative z-10">Login</span>
                    <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 lg:hidden">
              {currentUser && (
                <button
                  ref={notifBtnRef}
                  onClick={() => setIsNotifOpen((o) => !o)}
                  className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-[#0072D1]/10 transition-all duration-200 active:scale-95"
                  aria-label="Notifications"
                >
                  <Bell className="w-[17px] h-[17px] text-gray-600" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] bg-[#FF5A00] text-white text-[9px] font-black rounded-full flex items-center justify-center px-0.5 leading-none shadow-sm">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>
              )}

              {currentUser && (
                <button
                  onClick={() => setIsMessagingOpen(true)}
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-[#0072D1]/10 transition-all duration-200 active:scale-95"
                  aria-label="Messages"
                >
                  <MessageSquare className="w-[17px] h-[17px] text-gray-600" />
                </button>
              )}

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#0072D1] text-white hover:bg-[#005baa] transition-all duration-200 active:scale-95 focus:outline-none"
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm overlay-fade-in"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <div className="absolute top-0 right-0 bottom-0 w-[85%] max-w-[360px] bg-white shadow-2xl drawer-slide-in flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h1 className="text-xl font-bold tracking-widest flex items-center">
                <span className="text-[#0072D1]">FIXIT</span>
                <span className="text-[#FF5A00]">NOW</span>
              </h1>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors active:scale-95"
                aria-label="Close menu"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain">
              <div className="px-5 pt-4 pb-2" ref={searchContainerRef}>
                <form onSubmit={handleSearchSubmit} className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-[#0072D1]" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search services, categories, cities..."
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                    className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl bg-gray-50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0072D1]/20 focus:border-[#0072D1] focus:bg-white transition-all"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={clearSearchBar}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center bg-transparent border-none outline-none cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5 text-gray-400" />
                    </button>
                  )}
                  {renderSearchSuggestions()}
                </form>
              </div>

              <div className="px-3 pt-2 pb-1">
                <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Navigation
                </p>
                {[
                  { label: "Home", section: "home" },
                  { label: "About", section: "about" },
                  { label: "Contact", section: "contact" },
                ].map((item, idx) => (
                  <button
                    key={item.section}
                    className="menu-item-slide w-full text-left font-semibold text-gray-700 text-sm px-3 py-3 rounded-xl hover:bg-[#0072D1]/5 hover:text-[#0072D1] transition-all duration-200 bg-transparent border-none outline-none cursor-pointer flex items-center justify-between group"
                    style={{ animationDelay: `${idx * 50}ms` }}
                    onClick={() => {
                      handleNavigation(item.section);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <span>{item.label}</span>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#0072D1] transition-colors" />
                  </button>
                ))}
              </div>

              <div className="mx-5 my-1 h-px bg-gray-100" />

              <div className="px-5 py-3 space-y-2.5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 px-0 py-1">
                  Quick Actions
                </p>

                <button
                  className="menu-item-slide relative overflow-hidden flex items-center gap-3 w-full bg-gradient-to-r from-[#FF5A00] to-[#FF7A2E] text-white px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-300 active:scale-[0.98] group shadow-sm shadow-[#FF5A00]/20"
                  style={{ animationDelay: "100ms" }}
                  onClick={() => {
                    navigate("/browseplace");
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                    <Search className="w-4 h-4" />
                  </div>
                  <span className="relative z-10">Find Service</span>
                  <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </button>

                {(userRole === "service_provider" || userRole === "admin") && (
                  <button
                    className="menu-item-slide relative overflow-hidden flex items-center gap-3 w-full bg-gradient-to-r from-[#0072D1] to-[#1E8FE8] text-white px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-300 active:scale-[0.98] group shadow-sm shadow-[#0072D1]/20"
                    style={{ animationDelay: "150ms" }}
                    onClick={() => {
                      navigate("/add-post");
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                      <Plus className="w-4 h-4" />
                    </div>
                    <span className="relative z-10">Add Post</span>
                    <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  </button>
                )}
              </div>

              <div className="mx-5 my-1 h-px bg-gray-100" />

              <div className="px-5 py-3">
                {currentUser ? (
                  <div>
                    <div
                      className="menu-item-slide flex items-center gap-3 p-3 rounded-xl bg-gray-50 mb-3"
                      style={{ animationDelay: "200ms" }}
                    >
                      <ProfileAvatar size="lg" className="rounded-xl" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{getDisplayName()}</p>
                        <p className="text-xs text-gray-500 truncate">{getUsername()}</p>
                        {userRole && (
                          <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-wider text-[#FF5A00] bg-[#FF5A00]/10 px-1.5 py-0.5 rounded-full">
                            {userRole === "service_provider" ? "Provider" : userRole}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-0.5">
                      {getDropdownLinks().map((link, index) => {
                        const IconComponent = link.icon;
                        const isLogout = link.label === "Logout";
                        return (
                          <button
                            key={index}
                            onClick={() => {
                              if (link.path) {
                                navigate(link.path);
                              } else if (link.action) {
                                link.action();
                              }
                              setIsMobileMenuOpen(false);
                            }}
                            className={`menu-item-slide w-full text-left text-sm px-3 py-3 rounded-xl transition-all duration-200 bg-transparent border-none outline-none cursor-pointer flex items-center gap-3 group ${
                              isLogout
                                ? "text-red-500 hover:bg-red-50"
                                : "text-gray-700 hover:bg-gray-50 hover:text-[#0072D1]"
                            }`}
                            style={{ animationDelay: `${250 + index * 50}ms` }}
                          >
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                                isLogout
                                  ? "bg-red-50 group-hover:bg-red-100"
                                  : "bg-gray-100 group-hover:bg-[#0072D1]/10"
                              }`}
                            >
                              <IconComponent
                                className={`w-4 h-4 ${
                                  isLogout
                                    ? "text-red-500"
                                    : "text-gray-500 group-hover:text-[#0072D1]"
                                }`}
                              />
                            </div>
                            <span className="font-medium">{link.label}</span>
                            {!isLogout && <ChevronRight className="w-4 h-4 text-gray-300 ml-auto" />}
                          </button>
                        );
                      })}
                    </div>

                    {userRole === "service_provider" && (
                      <button
                        onClick={() => {
                          navigate("/edit-profile");
                          setIsMobileMenuOpen(false);
                        }}
                        className="menu-item-slide w-full mt-3 inline-flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white text-sm px-4 py-3 rounded-xl transition-all duration-200 font-semibold active:scale-[0.98]"
                        style={{ animationDelay: "350ms" }}
                      >
                        <Edit3 className="w-4 h-4" />
                        Edit Profile
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    className="menu-item-slide relative overflow-hidden w-full bg-gray-900 text-white px-5 py-3 rounded-xl font-semibold text-sm shadow-sm transition-all duration-300 hover:bg-[#0072D1] active:scale-[0.98] group"
                    style={{ animationDelay: "150ms" }}
                    onClick={() => {
                      navigate("/selectrole");
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <User className="w-4 h-4" />
                      Login / Sign Up
                    </span>
                    <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  </button>
                )}
              </div>
            </div>

            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50">
              <p className="text-[10px] text-gray-400 text-center font-medium">
                © 2024 FixitNow. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      )}

        {/* Mobile Notification Drawer */}
      {isNotifOpen && (
        <div className="fixed inset-0 z-[110] lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm overlay-fade-in"
            onClick={() => setIsNotifOpen(false)}
          />
          <div
            ref={mobileNotifDrawerRef}
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[80vh] flex flex-col drawer-slide-in-bottom"
            onPointerDown={(e) => {
              // Stop the capture-phase document pointerdown listener from
              // seeing events that originate inside the drawer. This is the
              // critical guard that allows notification items, "Mark all read",
              // and "Show older notifications" to complete their own handlers
              // without the drawer unmounting beneath them first.
              e.stopPropagation();
            }}
          >
            {renderNotificationContent(true)}
          </div>
        </div>
      )}

      {/* Calendar Modal */}
      {isCalendarModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setIsCalendarModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900">Booking Calendar</h2>
              <button
                onClick={() => setIsCalendarModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <BookingCalendar bookings={calendarBookings} />
            </div>
          </div>
        </div>
      )}

      <MessagingUI
        isOpen={isMessagingOpen}
        onClose={() => {
          setIsMessagingOpen(false);
          setSelectedConversationId(undefined);
        }}
        showSidebar={true}
        initialConversationId={selectedConversationId}
      />
    </>
  );
};

export default Navbar;