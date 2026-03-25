/**
 * messagingService.ts
 *
 * Core messaging service for real-time 1-on-1 chat between users.
 *
 * DATABASE STRUCTURE:
 * /conversations/{conversationId}
 *   ├── participantIds: [uid1, uid2]
 *   ├── participants: {
 *   │   uid1: { name, avatar, role },
 *   │   uid2: { name, avatar, role }
 *   │ }
 *   ├── lastMessage: string
 *   ├── lastMessageTime: Timestamp
 *   ├── deletedBy: string[]   ← NEW: tracks per-user soft deletes
 *   ├── createdAt: Timestamp
 *   ├── updatedAt: Timestamp
 *   └── /messages/{messageId}
 *       ├── senderId: uid
 *       ├── text: string
 *       ├── createdAt: Timestamp
 *       └── readBy: [uid]
 */

import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  orderBy,
  limit,
  serverTimestamp,
  writeBatch,
  arrayUnion,
  type Unsubscribe,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { notificationService } from './notificationService';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ConversationParticipant {
  name: string;
  avatar?: string | null;
  role: 'seeker' | 'service_provider' | 'admin';
  uid?: string;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  participants: Record<string, ConversationParticipant>;
  lastMessage?: string;
  lastMessageTime?: Date;
  deletedBy?: string[]; // ← NEW: soft-delete per user
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  text: string;
  createdAt: Date;
  readBy?: string[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const conversationsCol = collection(db, 'conversations');

/**
 * Generate a deterministic conversation ID from two user IDs (always sorted).
 */
function generateConversationId(userId1: string, userId2: string): string {
  const [id1, id2] = [userId1, userId2].sort();
  return `${id1}_${id2}`;
}

function toDate(value: any): Date {
  if (!value) return new Date();
  if (value instanceof Timestamp) return value.toDate();
  if (typeof value?.toDate === 'function') return value.toDate();
  if (value instanceof Date) return value;
  return new Date();
}

function docToConversation(snap: any): Conversation {
  const d = snap.data();
  return {
    id: snap.id,
    participantIds: d.participantIds ?? [],
    participants: d.participants ?? {},
    lastMessage: d.lastMessage ?? '',
    lastMessageTime: toDate(d.lastMessageTime),
    deletedBy: d.deletedBy ?? [],
    createdAt: toDate(d.createdAt),
    updatedAt: toDate(d.updatedAt),
  };
}

function docToMessage(snap: any): Message {
  const d = snap.data();
  return {
    id: snap.id,
    conversationId: snap.ref.parent.parent?.id || '',
    senderId: d.senderId ?? '',
    senderName: d.senderName ?? 'Unknown',
    senderAvatar: d.senderAvatar,
    text: d.text ?? '',
    createdAt: toDate(d.createdAt),
    readBy: d.readBy ?? [],
  };
}

function sortMessages(messages: Message[]): Message[] {
  return [...messages].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
}

function sortConversations(conversations: Conversation[]): Conversation[] {
  return [...conversations].sort((a, b) => {
    const timeA = a.lastMessageTime?.getTime() ?? 0;
    const timeB = b.lastMessageTime?.getTime() ?? 0;
    return timeB - timeA;
  });
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const messagingService = {
  /**
   * Get or create a 1-on-1 conversation between two users.
   *
   * FIX: If a conversation was previously soft-deleted by the current user
   * (i.e., their UID is in `deletedBy`), we remove them from `deletedBy` so
   * the conversation reappears in their inbox when a new message is sent or
   * they start the conversation again.
   */
  async getOrCreateConversation(
    currentUserId: string,
    otherUserId: string,
    currentUserData: ConversationParticipant,
    otherUserData: ConversationParticipant
  ): Promise<string> {
    const conversationId = generateConversationId(currentUserId, otherUserId);
    const conversationRef = doc(conversationsCol, conversationId);

    try {
      const conversationSnap = await getDoc(conversationRef);

      if (conversationSnap.exists()) {
        const data = conversationSnap.data();
        const deletedBy: string[] = data.deletedBy ?? [];

        // Always refresh participant data (avatar/name may have changed) and
        // restore soft-delete if applicable — single atomic update.
        const updatePayload: Record<string, any> = {
          [`participants.${currentUserId}`]: {
            name: currentUserData.name,
            avatar: currentUserData.avatar ?? null,
            role: currentUserData.role,
          },
        };
        if (deletedBy.includes(currentUserId)) {
          updatePayload.deletedBy = deletedBy.filter((id) => id !== currentUserId);
          console.log('[messagingService] Restored soft-deleted conversation:', conversationId);
        }
        await updateDoc(conversationRef, updatePayload);

        return conversationId;
      }

      // Create brand-new conversation
      console.log('[messagingService] Creating new conversation:', conversationId);
      const now = new Date();

      await setDoc(conversationRef, {
        participantIds: [currentUserId, otherUserId],
        participants: {
          [currentUserId]: {
            name: currentUserData.name,
            avatar: currentUserData.avatar ?? null,
            role: currentUserData.role,
          },
          [otherUserId]: {
            name: otherUserData.name,
            avatar: otherUserData.avatar ?? null,
            role: otherUserData.role,
          },
        },
        lastMessage: '',
        lastMessageTime: now,
        deletedBy: [], // ← initialise empty
        createdAt: now,
        updatedAt: now,
      });

      return conversationId;
    } catch (error) {
      console.error('[messagingService.getOrCreateConversation] Error:', error);
      throw new Error('Failed to get or create conversation');
    }
  },

  /**
   * Send a message. If the recipient had soft-deleted this conversation,
   * restore it for them so the new message appears in their inbox.
   */
  async sendMessage(
    conversationId: string,
    senderId: string,
    senderName: string,
    senderAvatar: string | undefined,
    text: string
  ): Promise<void> {
    if (!text.trim()) throw new Error('Message cannot be empty');

    try {
      const conversationRef = doc(conversationsCol, conversationId);
      const messagesCol = collection(conversationRef, 'messages');
      const now = new Date();

      // Add message to subcollection
      await addDoc(messagesCol, {
        senderId,
        senderName,
        senderAvatar: senderAvatar ?? null,
        text: text.trim(),
        createdAt: now,
        readBy: [],
      });

      // Update conversation metadata.
      // IMPORTANT: also clear `deletedBy` so the conversation reappears for
      // the recipient if they had previously soft-deleted it.
      await updateDoc(conversationRef, {
        lastMessage: text.trim(),
        lastMessageTime: now,
        updatedAt: now,
        deletedBy: [], // ← restore for all participants when a new message arrives
      });

      // Notify recipient
      const conversationSnap = await getDoc(conversationRef);
      if (conversationSnap.exists()) {
        const data = conversationSnap.data();
        const participantIds: string[] = data.participantIds ?? [];
        const recipientId = participantIds.find((id) => id !== senderId);
        if (recipientId) {
          try {
            await notificationService.createMessageNotification(
              recipientId,
              conversationId,
              senderName,
              text.trim()
            );
          } catch (notifError) {
            console.warn('[messagingService] Failed to create notification:', notifError);
          }
        }
      }

      console.log('[messagingService] Message sent successfully');
    } catch (error) {
      console.error('[messagingService.sendMessage] Error:', error);
      throw new Error('Failed to send message');
    }
  },

  listenToMessages(
    conversationId: string,
    callback: (messages: Message[]) => void
  ): Unsubscribe {
    const conversationRef = doc(conversationsCol, conversationId);
    const messagesCol = collection(conversationRef, 'messages');
    const q = query(messagesCol, orderBy('createdAt', 'asc'));

    return onSnapshot(
      q,
      (snap) => {
        const messages = sortMessages(snap.docs.map(docToMessage));
        callback(messages);
      },
      (error) => {
        console.error('[messagingService] Messages listener error:', error);
        callback([]);
      }
    );
  },

  /**
   * Real-time listener for conversations, filtered to exclude soft-deleted ones.
   */
  listenToConversations(
    userId: string,
    callback: (conversations: Conversation[]) => void
  ): Unsubscribe {
    const q = query(conversationsCol, where('participantIds', 'array-contains', userId));

    return onSnapshot(
      q,
      (snap) => {
        const all = snap.docs.map(docToConversation);
        // Client-side filter: hide conversations the user has soft-deleted
        const visible = all.filter((c) => !(c.deletedBy ?? []).includes(userId));
        callback(sortConversations(visible));
      },
      (error) => {
        console.error('[messagingService] Conversations listener error:', error);
        callback([]);
      }
    );
  },

  async fetchConversation(conversationId: string): Promise<Conversation | null> {
    try {
      const conversationRef = doc(conversationsCol, conversationId);
      const snap = await getDoc(conversationRef);
      if (snap.exists()) return docToConversation(snap);
      return null;
    } catch (error) {
      console.error('[messagingService.fetchConversation] Error:', error);
      throw error;
    }
  },

  async fetchMessages(conversationId: string, limitCount: number = 50): Promise<Message[]> {
    try {
      const conversationRef = doc(conversationsCol, conversationId);
      const messagesCol = collection(conversationRef, 'messages');
      const q = query(messagesCol, orderBy('createdAt', 'asc'), limit(limitCount));
      const snap = await getDocs(q);
      return sortMessages(snap.docs.map(docToMessage));
    } catch (error) {
      console.error('[messagingService.fetchMessages] Error:', error);
      throw error;
    }
  },

  async markMessageAsRead(
    conversationId: string,
    messageId: string,
    userId: string
  ): Promise<void> {
    try {
      const conversationRef = doc(conversationsCol, conversationId);
      const messageRef = doc(collection(conversationRef, 'messages'), messageId);
      const messageSnap = await getDoc(messageRef);
      if (messageSnap.exists()) {
        const data = messageSnap.data();
        const readBy = data.readBy ?? [];
        if (!readBy.includes(userId)) {
          await updateDoc(messageRef, { readBy: [...readBy, userId] });
        }
      }
    } catch (error) {
      console.error('[messagingService.markMessageAsRead] Error:', error);
    }
  },

  /**
   * Soft-delete a conversation for the current user only ("Delete for me").
   *
   * LOGIC:
   * - Adds `userId` to the `deletedBy` array on the conversation document.
   * - The conversation (and its messages) remain intact in Firestore.
   * - The other participant continues to see it normally.
   * - The `listenToConversations` listener filters out docs where the
   *   current user's UID is in `deletedBy`, so it disappears from their inbox.
   * - If either participant sends a new message later, `deletedBy` is cleared
   *   so both users see the conversation again.
   */
  async deleteConversationForMe(conversationId: string, userId: string): Promise<void> {
    try {
      const conversationRef = doc(conversationsCol, conversationId);
      await updateDoc(conversationRef, {
        deletedBy: arrayUnion(userId),
        updatedAt: new Date(),
      });
      console.log('[messagingService] Soft-deleted conversation for user:', userId);
    } catch (error) {
      console.error('[messagingService.deleteConversationForMe] Error:', error);
      throw new Error('Failed to delete conversation');
    }
  },

  /**
   * Hard-delete (legacy — kept for admin use).
   * Removes the conversation and ALL messages for BOTH participants.
   */
  async deleteConversation(conversationId: string): Promise<void> {
    try {
      const conversationRef = doc(conversationsCol, conversationId);
      const messagesCol = collection(conversationRef, 'messages');
      const messagesSnap = await getDocs(messagesCol);
      const batch = writeBatch(db);
      messagesSnap.docs.forEach((d) => batch.delete(d.ref));
      batch.delete(conversationRef);
      await batch.commit();
      console.log('[messagingService] Hard-deleted conversation:', conversationId);
    } catch (error) {
      console.error('[messagingService.deleteConversation] Error:', error);
      throw new Error('Failed to delete conversation');
    }
  },
};