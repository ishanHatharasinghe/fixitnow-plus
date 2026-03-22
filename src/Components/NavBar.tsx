import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Search, User, Edit3, LogOut, Plus, Eye, Shield, Settings, Bell, CheckCheck, CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { notificationService, type AppNotification } from "../services/notificationService";

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, userProfile, userRole, signOut } = useAuth();

  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const notifBtnRef = useRef<HTMLButtonElement>(null);

  // ── Real-time notifications subscription ──────────────────────────────────
  useEffect(() => {
    if (!currentUser?.uid) {
      setNotifications([]);
      return;
    }
    const unsub = notificationService.subscribeToNotifications(
      currentUser.uid,
      (notifs) => setNotifications(notifs)
    );
    return () => unsub();
  }, [currentUser?.uid]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = async () => {
    if (!currentUser?.uid) return;
    try {
      await notificationService.markAllAsRead(currentUser.uid);
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const handleNotifItemClick = async (notif: AppNotification) => {
    if (!notif.read) {
      try {
        await notificationService.markAsRead(notif.id);
      } catch (err) {
        console.error("Failed to mark as read:", err);
      }
    }
    setIsNotifOpen(false);
  };

  // Close notification dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        notifRef.current && !notifRef.current.contains(e.target as Node) &&
        notifBtnRef.current && !notifBtnRef.current.contains(e.target as Node)
      ) {
        setIsNotifOpen(false);
      }
    };
    if (isNotifOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isNotifOpen]);

  // Close dropdown when clicking outside
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

  // Handle logout with navigation
  const handleLogout = async () => {
    try {
      await signOut();
      setIsProfileDropdownOpen(false);
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Get display name from profile
  const getDisplayName = () => {
    // Try firstName + lastName combination first
    if (userProfile?.firstName || (userProfile as any)?.lastName) {
      const firstName = userProfile?.firstName || '';
      const lastName = (userProfile as any)?.lastName || '';
      const fullName = `${firstName} ${lastName}`.trim();
      if (fullName) return fullName;
    }
    // Fall back to displayName
    if (userProfile?.displayName) return userProfile.displayName;
    if (currentUser?.displayName) return currentUser.displayName;
    return "User";
  };

  // Get username/email for display
  const getUsername = () => {
    return currentUser?.email || "";
  };

  // Navigate with scroll functionality
  const handleNavigation = (sectionId: string) => {
    const el = document.getElementById(sectionId);

    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else {
      if (location.pathname !== "/") {
        navigate("/");
        setTimeout(() => {
          const element = document.getElementById(sectionId);
          if (element) {
            element.scrollIntoView({ behavior: "smooth" });
          }
        }, 100);
      }
    }
  };

  // Role-based dropdown links configuration
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
      seeker: [
        baseLink.findService,
        baseLink.logout,
      ],
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
          path: "/myposts",
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

  return (
    <nav className="w-full bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <button
            onClick={() => handleNavigation("home")}
            className="flex-shrink-0 flex items-center cursor-pointer bg-transparent border-none outline-none hover:opacity-80 transition-opacity"
          >
            <h1 className="text-2xl font-rostex font-bold tracking-widest flex items-center">
              <span className="text-[#0072D1]">FIXIT</span>
              <span className="text-[#FF5A00]">NOW</span>
            </h1>
          </button>

          {/* Desktop Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-sm mx-6">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-[#0072D1]" />
              </div>
              <input
                type="text"
                placeholder="Search"
                className="block w-full pl-9 pr-4 py-2 border border-[#0072D1]/40 rounded-full bg-white
                  text-sm text-[#0072D1] placeholder-[#0072D1] focus:outline-none focus:ring-2
                  focus:ring-[#0072D1]/30 focus:border-[#0072D1] transition-all"
              />
            </div>
          </div>

          {/* Desktop Navigation and Buttons */}
          <div className="hidden lg:flex items-center gap-5">
            {/* Nav links */}
            <div className="flex gap-5 text-[#0072D1] font-medium text-sm">
              <button
                className="hover:text-blue-800 transition-colors bg-transparent border-none outline-none cursor-pointer"
                onClick={() => handleNavigation("home")}
              >
                Home
              </button>
              <button
                className="hover:text-blue-800 transition-colors bg-transparent border-none outline-none cursor-pointer"
                onClick={() => handleNavigation("about")}
              >
                About
              </button>
              <button
                className="hover:text-blue-800 transition-colors bg-transparent border-none outline-none cursor-pointer"
                onClick={() => handleNavigation("contact")}
              >
                Contact
              </button>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              {/* Find Service */}
              <button
                className="relative overflow-hidden flex items-center gap-1.5 bg-[#FF5A00]
                text-white px-4 py-2 rounded-lg font-semibold text-sm shadow-sm
                transition-all duration-300 hover:bg-black hover:scale-105 group"
                onClick={() => navigate("/browseplace")}
              >
                <Search className="w-4 h-4" />
                <span className="relative z-10">Find Service</span>
                <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </button>

              {/* Add Post - Only for Service Providers and Admins */}
              {(userRole === "service_provider" || userRole === "admin") && (
                <button
                  className="relative overflow-hidden flex items-center gap-1.5 bg-[#0072D1]
                  text-white px-4 py-2 rounded-lg font-semibold text-sm shadow-sm
                  transition-all duration-300 hover:bg-black hover:scale-105 group"
                  onClick={() => navigate("/add-post")}
                >
                  <Plus className="w-4 h-4" />
                  <span className="relative z-10">Add Post</span>
                  <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </button>
              )}

              {/* Notification Bell — only for logged-in users */}
              {currentUser && (
                <div className="relative">
                  <button
                    ref={notifBtnRef}
                    onClick={() => setIsNotifOpen((o) => !o)}
                    className="relative w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-[#0072D1]/10 transition-colors"
                    aria-label="Notifications"
                  >
                    <Bell className="w-5 h-5 text-gray-600" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-[#FF5A00] text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 leading-none">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown */}
                  {isNotifOpen && (
                    <div
                      ref={notifRef}
                      className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between px-4 py-3 bg-black">
                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4 text-white" />
                          <span className="text-white text-sm font-bold">Notifications</span>
                          {unreadCount > 0 && (
                            <span className="bg-[#FF5A00] text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                              {unreadCount}
                            </span>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="flex items-center gap-1 text-[11px] text-gray-300 hover:text-white transition-colors font-medium"
                          >
                            <CheckCheck className="w-3.5 h-3.5" />
                            Mark all read
                          </button>
                        )}
                      </div>

                      {/* Notification list */}
                      <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                        {notifications.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                            <Bell className="w-8 h-8 mb-2 text-gray-200" />
                            <p className="text-xs font-medium">No notifications yet</p>
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <button
                              key={notif.id}
                              onClick={() => handleNotifItemClick(notif)}
                              className={`w-full text-left px-4 py-3 transition-colors hover:bg-gray-50 flex items-start gap-3 ${!notif.read ? "bg-[#0072D1]/5" : ""}`}
                            >
                              {/* Icon */}
                              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-0.5 ${notif.type === "post_approved" ? "bg-green-100" : "bg-red-100"}`}>
                                {notif.type === "post_approved"
                                  ? <CheckCircle className="w-4 h-4 text-green-600" />
                                  : <XCircle className="w-4 h-4 text-red-500" />
                                }
                              </div>
                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <p className={`text-xs font-bold leading-snug ${!notif.read ? "text-gray-900" : "text-gray-600"}`}>
                                  {notif.title}
                                </p>
                                <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed line-clamp-2">
                                  {notif.message}
                                </p>
                                <p className="text-[10px] text-gray-400 mt-1">
                                  {notif.createdAt.toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                                </p>
                              </div>
                              {/* Unread dot */}
                              {!notif.read && (
                                <span className="flex-shrink-0 w-2 h-2 rounded-full bg-[#FF5A00] mt-1.5" />
                              )}
                            </button>
                          ))
                        )}
                      </div>

                      {/* Footer */}
                      {notifications.length > 0 && (
                        <div className="border-t border-gray-100 px-4 py-2.5 text-center">
                          <button
                            onClick={() => { navigate("/profile"); setIsNotifOpen(false); }}
                            className="text-xs text-[#0072D1] font-bold hover:underline"
                          >
                            View all in Profile →
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Profile Dropdown or Login Button */}
              {currentUser ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    ref={profileButtonRef}
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center justify-center bg-transparent border-none outline-none cursor-pointer hover:opacity-80 transition-opacity"
                    aria-label="Toggle profile menu"
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {userProfile?.photoURL ? (
                        <img
                          src={userProfile.photoURL}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-6 h-6 text-gray-600" />
                      )}
                    </div>
                  </button>

                  {/* Profile Dropdown Menu */}
                  {isProfileDropdownOpen && (
                    <div
                      className="absolute right-0 mt-3 w-72 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden"
                      ref={dropdownRef}
                    >
                      {/* Top Section - Black Background */}
                      <div className="bg-black px-5 py-4">
                        <div className="flex items-start gap-3">
                          {/* Profile Image */}
                          <div className="w-14 h-14 rounded-full bg-gray-400 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {userProfile?.photoURL ? (
                              <img
                                src={userProfile.photoURL}
                                alt="Profile"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User className="w-8 h-8 text-gray-600" />
                            )}
                          </div>

                          {/* User Info and Edit Button */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-white font-semibold text-sm truncate">
                              {getDisplayName()}
                            </h3>
                            <p className="text-gray-300 text-xs truncate mt-0.5">
                              @{getUsername()}
                            </p>
                            {userRole === 'service_provider' && (
                              <button
                                onClick={() => {
                                  navigate("/edit-profile");
                                  setIsProfileDropdownOpen(false);
                                }}
                                className="mt-2.5 inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded-full transition-colors font-medium"
                              >
                                <Edit3 className="w-3 h-3" />
                                Edit Profile
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Bottom Section - Blue Background with Role-Based Links */}
                      <div className="bg-[#0072D1] py-1">
                        {getDropdownLinks().map((link, index) => {
                          const IconComponent = link.icon;
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
                              className="w-full text-left px-5 py-2.5 text-white text-sm hover:bg-blue-800 transition-colors flex items-center gap-3"
                            >
                              <IconComponent className="w-4 h-4 flex-shrink-0" />
                              {link.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  className="relative overflow-hidden bg-black text-white px-5 py-2 rounded-lg font-semibold text-sm shadow-sm transition-all duration-300 hover:bg-[#0072D1] hover:scale-105 group"
                  onClick={() => navigate("/selectrole")}
                >
                  <span className="relative z-10">Login</span>
                  <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </button>
              )}
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="bg-[#0072D1] text-white p-2 rounded-full hover:bg-black transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0072D1]"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="px-4 pt-4 pb-5 space-y-3">
            {/* Mobile Search */}
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-[#0072D1]" />
              </div>
              <input
                type="text"
                placeholder="Search"
                className="block w-full pl-9 pr-4 py-2.5 border border-[#0072D1]/40 rounded-xl
                  bg-white text-sm text-[#0072D1] placeholder-[#0072D1] focus:outline-none
                  focus:ring-2 focus:ring-[#0072D1]/30"
              />
            </div>

            {/* Mobile Navigation Links */}
            <div className="flex flex-col gap-1 pb-3 border-b border-gray-100">
              <button
                className="text-[#0072D1] font-medium text-sm px-2 py-1.5 rounded-lg hover:bg-blue-50 transition-colors bg-transparent border-none outline-none cursor-pointer"
                onClick={() => {
                  handleNavigation("home");
                  setIsMobileMenuOpen(false);
                }}
              >
                Home
              </button>
              <button
                className="text-[#0072D1] font-medium text-sm px-2 py-1.5 rounded-lg hover:bg-blue-50 transition-colors bg-transparent border-none outline-none cursor-pointer"
                onClick={() => {
                  handleNavigation("about");
                  setIsMobileMenuOpen(false);
                }}
              >
                About
              </button>
              <button
                className="text-[#0072D1] font-medium text-sm px-2 py-1.5 rounded-lg hover:bg-blue-50 transition-colors bg-transparent border-none outline-none cursor-pointer"
                onClick={() => {
                  handleNavigation("contact");
                  setIsMobileMenuOpen(false);
                }}
              >
                Contact
              </button>
            </div>

            {/* Mobile Action Buttons */}
            <div className="flex flex-col gap-2 pt-1">
              {/* Find Service */}
              <button
                className="relative overflow-hidden flex items-center justify-center gap-2 w-full bg-[#FF5A00] text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 hover:bg-black hover:scale-105 group shadow-sm"
                onClick={() => {
                  navigate("/browseplace");
                  setIsMobileMenuOpen(false);
                }}
              >
                <Search className="w-4 h-4 relative z-10 flex-shrink-0" />
                <span className="relative z-10">Find Service</span>
                <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </button>

              {/* Add Post - Only for Service Providers and Admins */}
              {(userRole === "service_provider" || userRole === "admin") && (
                <button
                  className="relative overflow-hidden flex items-center justify-center gap-2 w-full bg-[#0072D1] text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 hover:bg-black hover:scale-105 group shadow-sm"
                  onClick={() => {
                    navigate("/add-post");
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <Plus className="w-4 h-4 relative z-10 flex-shrink-0" />
                  <span className="relative z-10">Add Post</span>
                  <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </button>
              )}

              {/* Mobile Profile Section */}
              {currentUser ? (
                <div className="border-t border-gray-100 pt-3 mt-3">
                  <div className="flex items-center gap-3 pb-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {userProfile?.photoURL ? (
                        <img
                          src={userProfile.photoURL}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-6 h-6 text-gray-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {getDisplayName()}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {getUsername()}
                      </p>
                    </div>
                  </div>

                  {/* Mobile Role-Based Links */}
                  <div className="flex flex-col gap-1">
                    {getDropdownLinks().map((link, index) => {
                      const IconComponent = link.icon;
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
                          className="text-[#0072D1] font-medium text-sm px-2 py-2 rounded-lg hover:bg-blue-50 transition-colors bg-transparent border-none outline-none cursor-pointer flex items-center gap-2"
                        >
                          <IconComponent className="w-4 h-4" />
                          {link.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Edit Profile Button - Only for Service Providers */}
                  {userRole === 'service_provider' && (
                    <button
                      onClick={() => {
                        navigate("/edit-profile");
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full mt-3 inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition-colors font-medium"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit Profile
                    </button>
                  )}
                </div>
              ) : (
                <button
                  className="relative overflow-hidden w-full bg-black text-white px-5 py-2.5 rounded-lg font-semibold text-sm shadow-sm transition-all duration-300 hover:bg-[#0072D1] hover:scale-105 group"
                  onClick={() => {
                    navigate("/selectrole");
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <span className="relative z-10">Login</span>
                  <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;