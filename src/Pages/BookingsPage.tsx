import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useMessaging } from "../contexts/MessagingContext";
import { bookingService, type Booking } from "../services/bookingService";
import { notificationService } from "../services/notificationService";
import { userService } from "../services/userService";
import { db } from "../firebase";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { MessageSquare, User } from "lucide-react";
import MessagingUI from "../Components/MessagingUI";
import BookingCalendar from "../Components/BookingCalendar";
import CancelReasonModal from "../Components/CancelReasonModal";

const BookingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, userRole } = useAuth();
  const { startConversation } = useMessaging();
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [incomingBookings, setIncomingBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [providerNames, setProviderNames] = useState<Record<string, string>>({});
  const [customerNames, setCustomerNames] = useState<Record<string, string>>({});
  const [isMessagingOpen, setIsMessagingOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  // Cancel modal state
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedBookingForCancel, setSelectedBookingForCancel] = useState<Booking | null>(null);
  const [cancelActionType, setCancelActionType] = useState<"customer_cancel" | "provider_cancel" | "provider_decline">("customer_cancel");

  const isProvider = userRole === "service_provider";
  const isSeeker = userRole === "seeker";
  const isAdmin = userRole === "admin";

  useEffect(() => {
    if (!currentUser?.uid) {
      setMyBookings([]);
      setIncomingBookings([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const subs: Array<() => void> = [];

    if (isSeeker || isAdmin) {
      const u = bookingService.subscribeToCustomerBookings(currentUser.uid, async (bookings) => {
        setMyBookings(bookings);
        await loadProviderNames(bookings.map(b => b.providerId));
      });
      subs.push(u);
    }

    if (isProvider || isAdmin) {
      const u = bookingService.subscribeToProviderBookings(currentUser.uid, async (bookings) => {
        setIncomingBookings(bookings);
        await loadProviderNames(bookings.map(b => b.providerId));
        await loadCustomerNames(bookings.map(b => b.customerId));
      });
      subs.push(u);
    }

    setLoading(false);

    return () => subs.forEach((unsubscribe) => unsubscribe());
  }, [currentUser?.uid, isSeeker, isProvider, isAdmin]);

  const loadProviderNames = async (providerIds: string[]) => {
    const uniqIds = Array.from(new Set(providerIds)).filter(Boolean);
    if (!uniqIds.length) return;
    const missingIds = uniqIds.filter((id) => !providerNames[id]);
    if (!missingIds.length) return;

    try {
      const names: Record<string, string> = {};
      for (const providerId of missingIds) {
        const docSnap = await getDoc(doc(db, "users", providerId));
        if (!docSnap.exists()) continue;
        const data = docSnap.data() as any;
        names[providerId] =
          [data.firstName, data.lastName].filter(Boolean).join(" ") ||
          data.displayName ||
          data.email ||
          "Provider";
      }
      setProviderNames((prev) => ({ ...prev, ...names }));
    } catch (err) {
      console.error("Failed to load provider names", err);
    }
  };

  const loadCustomerNames = async (customerIds: string[]) => {
    const uniqIds = Array.from(new Set(customerIds)).filter(Boolean);
    if (!uniqIds.length) return;
    const missingIds = uniqIds.filter((id) => !customerNames[id]);
    if (!missingIds.length) return;

    try {
      const names: Record<string, string> = {};
      for (const customerId of missingIds) {
        const docSnap = await getDoc(doc(db, "users", customerId));
        if (!docSnap.exists()) continue;
        const data = docSnap.data() as any;
        names[customerId] =
          [data.firstName, data.lastName].filter(Boolean).join(" ") ||
          data.displayName ||
          data.email ||
          "Customer";
      }
      setCustomerNames((prev) => ({ ...prev, ...names }));
    } catch (err) {
      console.error("Failed to load customer names", err);
    }
  };

  const actionDisabled = (booking: Booking): boolean => {
    if (booking.status === "completed" || booking.status === "declined" || booking.status === "cancelled") return true;
    return false;
  };

  const updateStatus = async (booking: Booking, newStatus: Exclude<Booking["status"], "pending">) => {
    try {
      await bookingService.updateBookingStatus(booking.id, newStatus);

      // Notification logic based on status change:
      // 1. When service provider approves pending booking → notify customer (user)
      // 2. When service provider declines pending booking → notify customer (user)
      if (newStatus === "approved" && booking.status === "pending") {
        // Service provider approved → notify customer
        await notificationService.createBookingStatusNotification(
          booking.customerId,
          booking.id,
          "approved"
        );
      } else if (newStatus === "declined" && booking.status === "pending") {
        // Service provider declined pending booking → notify customer
        await notificationService.createBookingStatusNotification(
          booking.customerId,
          booking.id,
          "declined"
        );
      }
    } catch (err) {
      console.error("Failed to update booking status", err);
      setError("Failed to update booking status");
    }
  };

  const openCancelModal = (booking: Booking, actionType: "customer_cancel" | "provider_cancel" | "provider_decline") => {
    setSelectedBookingForCancel(booking);
    setCancelActionType(actionType);
    setIsCancelModalOpen(true);
  };

  const handleCancelReasonSubmit = async (reason: string) => {
    if (!selectedBookingForCancel) return;

    try {
      const booking = selectedBookingForCancel;

      if (cancelActionType === "customer_cancel") {
        // Customer/Admin cancelling an approved booking
        await bookingService.cancelBookingWithReason(booking.id, reason, booking.customerId === booking.providerId ? "admin" : "customer");
        // Notify service provider
        if (booking.providerId !== booking.customerId) {
          await notificationService.createBookingCancelledByCustomerNotification(
            booking.providerId,
            booking.id,
            booking.customerName,
            reason
          );
        }
      } else if (cancelActionType === "provider_cancel") {
        // Service provider cancelling an approved booking
        await bookingService.cancelBookingWithReason(booking.id, reason, "provider");
        // Notify customer
        await notificationService.createBookingCancelledByProviderNotification(
          booking.customerId,
          booking.id,
          providerNames[booking.providerId] || "Service Provider",
          reason
        );
      } else if (cancelActionType === "provider_decline") {
        // Service provider declining (pending or approved) booking
        await bookingService.declineBookingWithReason(booking.id, reason);
        // Notify customer
        await notificationService.createBookingDeclinedWithReasonNotification(
          booking.customerId,
          booking.id,
          reason
        );
      }

      setIsCancelModalOpen(false);
      setSelectedBookingForCancel(null);
    } catch (err) {
      console.error("Failed to cancel/decline booking", err);
      setError("Failed to process cancellation");
    }
  };

  const handleCancel = (booking: Booking) => {
    // Open modal for approved bookings to get reason
    if (booking.status === "approved") {
      openCancelModal(booking, "customer_cancel");
    } else {
      // For pending bookings, just use confirm
      if (window.confirm("Are you sure you want to cancel this booking?")) {
        updateStatus(booking, "cancelled");
      }
    }
  };

  const handleApprove = async (booking: Booking) => {
    await updateStatus(booking, "approved");
  };

  const handleDecline = (booking: Booking) => {
    // Always open modal for decline to get reason
    openCancelModal(booking, "provider_decline");
  };

  const handleProviderCancel = (booking: Booking) => {
    // Provider cancelling an approved booking
    openCancelModal(booking, "provider_cancel");
  };

  const handleComplete = async (booking: Booking) => {
    const now = new Date();
    if (booking.bookingDate > now) {
      alert("You can only mark completed on or after the booked date.");
      return;
    }
    await updateStatus(booking, "completed");
  };

  const myTitle = useMemo(() => {
    if (isProvider || isAdmin) return "My Bookings (as customer)";
    return "My Bookings";
  }, [isProvider, isAdmin]);

  if (!currentUser) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-lg font-bold">Please sign in to view bookings.</h2>
      </div>
    );
  }

  const isPastBookingDay = (bookingDate: Date) => {
    const now = new Date();
    return bookingDate.getTime() <= now.getTime();
  };

  const renderBookingCard = (booking: Booking, roleContext: "customer" | "provider") => {
    const providerName = providerNames[booking.providerId] || "Provider";
    const customerName = customerNames[booking.customerId] || booking.customerName || "Customer";
    const displayName = roleContext === "customer" ? providerName : customerName;
    return (
      <div key={booking.id} className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
        <div className="flex justify-between items-start gap-2">
          <div>
            <p className="text-sm font-semibold text-gray-700">{roleContext === "customer" ? "Provider" : "Customer"}: {displayName}</p>
            <p className="text-xs text-gray-500">Booking ID: {booking.id}</p>
          </div>
          <span className={`text-[11px] font-bold px-2 py-1 rounded-full ${
            booking.status === "pending" ? "bg-yellow-100 text-yellow-700" :
            booking.status === "approved" ? "bg-green-100 text-green-700" :
            booking.status === "declined" ? "bg-red-100 text-red-700" :
            booking.status === "completed" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"
          }`}>
            {booking.status}
          </span>
        </div>
        <div className="mt-3 text-sm text-gray-700 space-y-1">
          <p><strong>Name:</strong> {booking.customerName}</p>
          <p><strong>Contact:</strong> {booking.customerContact}</p>
          <p><strong>Address:</strong> <a href={`https://maps.google.com/?q=${encodeURIComponent(booking.address)}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{booking.address}</a></p>
          <p><strong>Home location:</strong> <a href={`https://maps.google.com/?q=${encodeURIComponent(booking.homeLocation)}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{booking.homeLocation}</a></p>
          <p><strong>Date:</strong> {booking.bookingDate.toLocaleString()}</p>
          {/* Show cancellation/decline reason if available */}
          {(booking.status === "cancelled" || booking.status === "declined") && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-xs font-bold text-red-700 mb-1">
                {booking.status === "cancelled" ? "Cancellation Reason:" : "Decline Reason:"}
              </p>
              <p className="text-xs text-red-600">
                {booking.status === "cancelled"
                  ? (booking.cancellationReason || "No reason provided")
                  : (booking.declinedReason || "No reason provided")}
              </p>
              {booking.cancelledBy && (
                <p className="text-[10px] text-red-400 mt-1 uppercase tracking-wide">
                  Cancelled by: {booking.cancelledBy}
                </p>
              )}
            </div>
          )}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {/* Status Management Buttons */}
          {/* Customer/Admin can cancel if booking is not completed/declined/cancelled */}
          {(roleContext === "customer" || isAdmin) && !actionDisabled(booking) && (
            <button onClick={() => handleCancel(booking)} className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-600">Cancel</button>
          )}
          {/* Provider can approve/decline pending bookings */}
          {roleContext === "provider" && booking.status === "pending" && (
            <>
              <button onClick={() => handleApprove(booking)} className="px-3 py-1.5 rounded-lg bg-green-500 text-white text-xs font-semibold hover:bg-green-600">Approve</button>
              <button onClick={() => handleDecline(booking)} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600">Decline</button>
            </>
          )}
          {/* Provider can cancel approved bookings (with reason popup) */}
          {roleContext === "provider" && booking.status === "approved" && (
            <button onClick={() => handleProviderCancel(booking)} className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-600">Cancel</button>
          )}
          {/* Mark as completed for approved bookings on past dates */}
          {isPastBookingDay(booking.bookingDate) && booking.status === "approved" && (
            <button onClick={() => handleComplete(booking)} className="px-3 py-1.5 rounded-lg bg-blue-500 text-white text-xs font-semibold hover:bg-blue-600">Mark Completed</button>
          )}
        </div>
        
        {/* Navigation Buttons */}
        <div className="mt-3 flex flex-wrap gap-2 border-t border-gray-100 pt-3">
          <button
            onClick={() => navigate(`/public-profile/${roleContext === "customer" ? booking.providerId : booking.customerId}`)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0072D1] text-white text-xs font-semibold hover:bg-[#005baa] transition-colors"
          >
            <User className="w-3.5 h-3.5" />
            {roleContext === "customer" ? "View Provider" : "View Customer"}
          </button>
          <button
            onClick={async () => {
              const otherUserId = roleContext === "customer" ? booking.providerId : booking.customerId;
              try {
                const otherUserData = await userService.getUser(otherUserId);
                if (otherUserData) {
                  await startConversation(otherUserId, {
                    name: otherUserData.displayName || otherUserData.email || "User",
                    avatar: otherUserData.profilePicture || null,
                    role: otherUserData.role || "seeker",
                  });
                  setIsMessagingOpen(true);
                }
              } catch (err) {
                console.error("Failed to start conversation", err);
                alert("Failed to open message. Please try again.");
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700 transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Send Message
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="font-rostex text-3xl md:text-[50px] uppercase tracking-wide leading-tight mb-8 text-center">
          <span className="text-[#0072D1]">Booking </span>
          <span className="text-[#FF5A00]">Management</span>
        </h1>

        {error && <div className="bg-red-100 text-red-700 mb-4 p-3 rounded-lg">{error}</div>}

        {loading ? (
          <div className="text-center text-gray-500">Loading bookings...</div>
        ) : (
          <div className="space-y-6">
            {/* My Bookings - Only for seekers */}
            {(isSeeker || isAdmin) && !isProvider && (
              <section>
                <h2 className="font-rostex text-xl md:text-2xl uppercase tracking-wide text-[#0072D1] mb-4">My Bookings</h2>
                {myBookings.length === 0 ? (
                  <p className="text-sm text-gray-500">No bookings yet.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {myBookings.map((booking) => renderBookingCard(booking, "customer"))}
                  </div>
                )}
              </section>
            )}

            {/* Incoming Bookings - Only for service providers */}
            {isProvider && (
              <section>
                <h2 className="font-rostex text-xl md:text-2xl uppercase tracking-wide text-[#FF5A00] mb-4">Incoming Bookings</h2>
                {incomingBookings.length === 0 ? (
                  <p className="text-sm text-gray-500">No incoming bookings yet.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {incomingBookings.map((booking) => renderBookingCard(booking, "provider"))}
                  </div>
                )}
              </section>
            )}

            {/* Booking Calendar */}
            <section>
              <h2 className="font-rostex text-xl md:text-2xl uppercase tracking-wide text-[#0072D1] mb-4">Booking Calendar</h2>
              <BookingCalendar bookings={isProvider ? incomingBookings : myBookings} />
            </section>
          </div>
        )}

        {/* Messaging UI */}
        {isMessagingOpen && (
          <MessagingUI
            isOpen={isMessagingOpen}
            onClose={() => {
              setIsMessagingOpen(false);
              setSelectedUserId(null);
            }}
            showSidebar={true}
          />
        )}

        {/* Cancel Reason Modal */}
        <CancelReasonModal
          isOpen={isCancelModalOpen}
          onClose={() => {
            setIsCancelModalOpen(false);
            setSelectedBookingForCancel(null);
          }}
          onSubmit={handleCancelReasonSubmit}
          title={
            cancelActionType === "provider_decline"
              ? "Decline Booking"
              : "Cancel Booking"
          }
          placeholder={
            cancelActionType === "provider_decline"
              ? "Please provide a reason for declining this booking..."
              : "Please provide a reason for cancelling this booking..."
          }
          confirmText={
            cancelActionType === "provider_decline"
              ? "Confirm Decline"
              : "Confirm Cancellation"
          }
          warningText={
            cancelActionType === "provider_decline"
              ? "The customer will be notified about this decline."
              : "This action will notify the other party about the cancellation."
          }
        />
      </div>
    </div>
  );
};

export default BookingsPage;
