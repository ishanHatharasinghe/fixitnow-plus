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
 *   type         : "post_approved" | "post_rejected"
 *   title        : short heading shown in the bell dropdown
 *   message      : full message body
 *   postId       : the related post id
 *   postTitle    : human-readable post title
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

export type NotificationType = "post_approved" | "post_rejected";

export interface AppNotification {
  id: string;
  recipientId: string;
  type: NotificationType;
  title: string;
  message: string;
  postId: string;
  postTitle: string;
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
      type: "post_rejected" as NotificationType,
      title: "Post Rejected",
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
};