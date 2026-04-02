/**
 * notificationService.ts
 *
 * Firestore-backed notification system.
 *
 * KEY DESIGN DECISIONS (matching postService.ts pattern):
 *  - NO orderBy() combined with where() — avoids composite Firestore index errors.
 *  - Results are sorted client-side after fetching / in the snapshot callback.
 *  - onSnapshot uses where('recipientId') ONLY — single-field index, auto-created.
 *
 * Collection: /notifications/{notificationId}
 * Fields:
 *   recipientId  : uid of the user who receives the notification
 *   type         : "post_approved" | "post_declined" | "booking_approved" | "booking_declined" | "new_message"
 *   title        : short heading shown in the bell dropdown
 *   message      : full message body
 *   postId       : the related post id
 *   postTitle    : human-readable post title
 *   conversationId : the related conversation id (for messages)
 *   senderName   : the sender's name (for messages)
 *   read         : boolean — false until the user marks it read
 *   createdAt    : serverTimestamp
 */

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  query,
  where,
  onSnapshot,
  writeBatch,
  serverTimestamp,
  Timestamp,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "../firebase";

// ─── Types ────────────────────────────────────────────────────────────────────

export type NotificationType = "post_approved" | "post_declined" | "booking_approved" | "booking_declined" | "booking_request" | "booking_cancelled" | "new_message";

export interface AppNotification {
  id: string;
  recipientId: string;
  type: NotificationType;
  title: string;
  message: string;
  postId?: string;
  postTitle?: string;
  conversationId?: string;
  senderName?: string;
  read: boolean;
  createdAt: Date;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const notificationsCol = collection(db, "notifications");

function toDate(value: any): Date {
  if (!value) return new Date();
  if (value instanceof Timestamp) return value.toDate();
  if (typeof value?.toDate === "function") return value.toDate();
  if (value instanceof Date) return value;
  return new Date();
}

function docToNotification(snap: any): AppNotification {
  const d = snap.data();
  return {
    id: snap.id,
    recipientId: d.recipientId ?? "",
    type: d.type ?? "post_approved",
    title: d.title ?? "",
    message: d.message ?? "",
    postId: d.postId ?? "",
    postTitle: d.postTitle ?? "",
    conversationId: d.conversationId ?? "",
    senderName: d.senderName ?? "",
    read: d.read ?? false,
    createdAt: toDate(d.createdAt),
  };
}

/** Sort newest-first client-side — no Firestore index needed */
function sortNewest(notifs: AppNotification[]): AppNotification[] {
  return [...notifs].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const notificationService = {

  /**
   * Called by admin when a post is APPROVED.
   * recipientId = the post's serviceProviderId.
   */
  async createApprovedNotification(
    recipientId: string,
    postId: string,
    postTitle: string
  ): Promise<void> {
    await addDoc(notificationsCol, {
      recipientId,
      type: "post_approved" as NotificationType,
      title: "Post Approved! 🎉",
      message: `Your post "${postTitle}" has been approved and is now live for seekers to discover.`,
      postId,
      postTitle,
      read: false,
      createdAt: serverTimestamp(),
    });
  },

  /**
   * Called by admin when a post is REJECTED.
   */
  async createRejectedNotification(
    recipientId: string,
    postId: string,
    postTitle: string,
    reason: string
  ): Promise<void> {
    await addDoc(notificationsCol, {
      recipientId,
      type: "post_declined" as NotificationType,
      title: "Post Declined",
      message: `Your post "${postTitle}" was not approved. Reason: ${reason}`,
      postId,
      postTitle,
      read: false,
      createdAt: serverTimestamp(),
    });
  },

  /**
   * Real-time listener — calls `callback` whenever the user's notifications change.
   * Uses where('recipientId') ONLY (single-field index — auto-created by Firestore).
   * Sorted client-side newest-first.
   * Returns the unsubscribe function — call it on component unmount.
   */
  subscribeToNotifications(
    userId: string,
    callback: (notifications: AppNotification[]) => void
  ): Unsubscribe {
    // Single where() clause only — no orderBy — avoids composite index requirement
    const q = query(
      notificationsCol,
      where("recipientId", "==", userId)
    );
    return onSnapshot(
      q,
      (snap) => {
        const notifs = sortNewest(snap.docs.map(docToNotification));
        callback(notifs);
      },
      (error) => {
        console.error("Notification listener error:", error);
        callback([]); // fail gracefully — don't crash the UI
      }
    );
  },

  /**
   * One-time fetch (used as fallback if real-time subscription fails).
   */
  async getNotificationsForUser(userId: string): Promise<AppNotification[]> {
    const snap = await getDocs(
      query(notificationsCol, where("recipientId", "==", userId))
    );
    return sortNewest(snap.docs.map(docToNotification));
  },

  /** Mark a single notification as read. */
  async markAsRead(notificationId: string): Promise<void> {
    await updateDoc(doc(notificationsCol, notificationId), { read: true });
  },

  /** Mark ALL unread notifications for a user as read in a single batch write. */
  async markAllAsRead(userId: string): Promise<void> {
    const snap = await getDocs(
      query(
        notificationsCol,
        where("recipientId", "==", userId),
        where("read", "==", false)
      )
    );
    if (snap.empty) return;
    const batch = writeBatch(db);
    snap.docs.forEach((d) => batch.update(d.ref, { read: true }));
    await batch.commit();
  },

  /**
   * Called when a new message is sent to notify the recipient.
   */
  async createMessageNotification(
    recipientId: string,
    conversationId: string,
    senderName: string,
    messageText: string
  ): Promise<void> {
    await addDoc(notificationsCol, {
      recipientId,
      type: "new_message" as NotificationType,
      title: `New message from ${senderName}`,
      message: messageText.length > 50 ? `${messageText.substring(0, 50)}...` : messageText,
      conversationId,
      senderName,
      read: false,
      createdAt: serverTimestamp(),
    });
  },

  async createBookingStatusNotification(
    recipientId: string,
    bookingId: string,
    status: "approved" | "declined" | "completed" | "cancelled"
  ): Promise<void> {
    const titles: Record<string, string> = {
      approved: "Booking Approved",
      declined: "Booking Declined",
      completed: "Booking Completed",
      cancelled: "Booking Cancelled",
    };
    const messages: Record<string, string> = {
      approved: "Your booking has been approved by the service provider.",
      declined: "Sorry, your booking has been declined by the service provider.",
      completed: "Great news! Your booking is marked as completed.",
      cancelled: "Your booking has been cancelled.",
    };
    await addDoc(notificationsCol, {
      recipientId,
      type: status === "approved" ? "booking_approved" : status === "declined" ? "booking_declined" : "post_approved",
      title: titles[status],
      message: messages[status],
      postId: bookingId,
      read: false,
      createdAt: serverTimestamp(),
    });
  },

  async createBookingRequestNotification(
    recipientId: string,
    bookingId: string,
    customerName: string,
    bookingDate: Date
  ): Promise<void> {
    await addDoc(notificationsCol, {
      recipientId,
      type: "booking_request" as NotificationType,
      title: "New Booking Request",
      message: `${customerName} requested a booking for ${bookingDate.toLocaleString()}`,
      postId: bookingId,
      read: false,
      createdAt: serverTimestamp(),
    });
  },

  /**
   * Called when a booking is cancelled by customer/admin after approval.
   * Notifies the service provider with the cancellation reason.
   */
  async createBookingCancelledByCustomerNotification(
    recipientId: string,
    bookingId: string,
    customerName: string,
    reason: string
  ): Promise<void> {
    await addDoc(notificationsCol, {
      recipientId,
      type: "booking_cancelled" as NotificationType,
      title: "Booking Cancelled by Customer",
      message: `${customerName} cancelled the booking. Reason: ${reason}`,
      postId: bookingId,
      read: false,
      createdAt: serverTimestamp(),
    });
  },

  /**
   * Called when a booking is cancelled/declined by service provider after approval.
   * Notifies the customer with the cancellation reason.
   */
  async createBookingCancelledByProviderNotification(
    recipientId: string,
    bookingId: string,
    providerName: string,
    reason: string
  ): Promise<void> {
    await addDoc(notificationsCol, {
      recipientId,
      type: "booking_cancelled" as NotificationType,
      title: "Booking Cancelled by Service Provider",
      message: `The service provider cancelled the booking. Reason: ${reason}`,
      postId: bookingId,
      read: false,
      createdAt: serverTimestamp(),
    });
  },

  /**
   * Called when a booking with reason is declined by service provider.
   * Notifies the customer with the decline reason.
   */
  async createBookingDeclinedWithReasonNotification(
    recipientId: string,
    bookingId: string,
    reason: string
  ): Promise<void> {
    await addDoc(notificationsCol, {
      recipientId,
      type: "booking_declined" as NotificationType,
      title: "Booking Declined",
      message: `Your booking has been declined. Reason: ${reason}`,
      postId: bookingId,
      read: false,
      createdAt: serverTimestamp(),
    });
  },
};
