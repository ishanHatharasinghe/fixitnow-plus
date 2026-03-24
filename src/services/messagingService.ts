/**
 * messagingService.ts
 *
 * Core messaging service for real-time 1-on-1 chat between users.
 * Implements WhatsApp/Messenger-style messaging architecture:
 *
 * DATABASE STRUCTURE:
 * /conversations/{conversationId}
 *   ├── participantIds: [uid1, uid2] (always exactly 2 users)
 *   ├── participants: {
 *   │   uid1: { name, avatar, role },
 *   │   uid2: { name, avatar, role }
 *   │ }
 *   ├── lastMessage: string
 *   ├── lastMessageTime: Timestamp
 *   ├── createdAt: Timestamp
 *   ├── updatedAt: Timestamp
 *   └── /messages/{messageId}
 *       ├── senderId: uid
 *       ├── text: string
 *       ├── createdAt: Timestamp
 *       └── readBy: [uid] (optional)
 *
 * KEY DESIGN DECISIONS:
 * 1. Conversations are identified by SORTED participant IDs (deterministic IDs)
 *    Example: conversation between user_a and user_b → ID = "user_a_user_b"
 * 2. Real-time listeners use onSnapshot for instant updates
 * 3. Notifications triggered when new messages arrive
 * 4. No serverTimestamp() in offline mode — use explicit Date.now()
 * 5. Participant data cached in conversation doc for quick header rendering
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
  type Unsubscribe,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { notificationService } from './notificationService';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ConversationParticipant {
  name: string;
  avatar?: string;
  role: 'seeker' | 'service_provider' | 'admin';
  uid?: string;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  participants: Record<string, ConversationParticipant>;
  lastMessage?: string;
  lastMessageTime?: Date;
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
 * Generate a deterministic conversation ID from two user IDs.
 * Example: userId1="alice", userId2="bob" → "alice_bob" or "bob_alice" (always sorted)
 *
 * This ensures:
 * - Fetching conversations between alice & bob always uses the same ID
 * - No duplicate conversations for the same user pair
 */
function generateConversationId(userId1: string, userId2: string): string {
  const [id1, id2] = [userId1, userId2].sort();
  return `${id1}_${id2}`;
}

/**
 * Convert Firestore Timestamp to JavaScript Date
 */
function toDate(value: any): Date {
  if (!value) return new Date();
  if (value instanceof Timestamp) return value.toDate();
  if (typeof value?.toDate === 'function') return value.toDate();
  if (value instanceof Date) return value;
  return new Date();
}

/**
 * Convert Firestore document snapshot to Conversation object
 */
function docToConversation(snap: any): Conversation {
  const d = snap.data();
  return {
    id: snap.id,
    participantIds: d.participantIds ?? [],
    participants: d.participants ?? {},
    lastMessage: d.lastMessage ?? '',
    lastMessageTime: toDate(d.lastMessageTime),
    createdAt: toDate(d.createdAt),
    updatedAt: toDate(d.updatedAt),
  };
}

/**
 * Convert Firestore message document to Message object
 */
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

/**
 * Sort messages by creation time (oldest first)
 */
function sortMessages(messages: Message[]): Message[] {
  return [...messages].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
}

/**
 * Sort conversations by last message time (newest first)
 */
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
   * LOGIC:
   * 1. Generate deterministic conversation ID from both user IDs
   * 2. Check if conversation document already exists
   * 3. If YES: return conversation ID (existing chat thread)
   * 4. If NO: create new conversation with participant data, return ID
   *
   * SIDE EFFECTS:
   * - Creates a new Firestore document if conversation doesn't exist
   * - Stores participant information for quick UI rendering
   *
   * @param currentUserId - authenticated user's UID
   * @param otherUserId - target user's UID to chat with
   * @param currentUserData - participant info (name, avatar, role)
   * @param otherUserData - target user's participant info
   * @returns Promise<string> - conversation ID
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

      // Conversation already exists — return its ID
      if (conversationSnap.exists()) {
        console.log('[messagingService] Conversation exists:', conversationId);
        return conversationId;
      }

      // Create new conversation
      console.log('[messagingService] Creating new conversation:', conversationId);
      const now = new Date();

      await setDoc(conversationRef, {
        participantIds: [currentUserId, otherUserId],
        participants: {
          [currentUserId]: {
            name: currentUserData.name,
            avatar: currentUserData.avatar,
            role: currentUserData.role,
          },
          [otherUserId]: {
            name: otherUserData.name,
            avatar: otherUserData.avatar,
            role: otherUserData.role,
          },
        },
        lastMessage: '',
        lastMessageTime: now,
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
   * Send a message in a conversation.
   *
   * LOGIC:
   * 1. Add message to subcollection: /conversations/{conversationId}/messages/{messageId}
   * 2. Update conversation's lastMessage and lastMessageTime
   * 3. Trigger notification to the recipient
   *
   * SIDE EFFECTS:
   * - Writes to Firestore
   * - Triggers notification service
   *
   * @param conversationId - conversation ID
   * @param senderId - sender's UID
   * @param senderName - sender's display name
   * @param senderAvatar - sender's avatar URL
   * @param text - message text
   * @returns Promise<void>
   */
  async sendMessage(
    conversationId: string,
    senderId: string,
    senderName: string,
    senderAvatar: string | undefined,
    text: string
  ): Promise<void> {
    if (!text.trim()) {
      throw new Error('Message cannot be empty');
    }

    try {
      const conversationRef = doc(conversationsCol, conversationId);
      const messagesCol = collection(conversationRef, 'messages');

      const now = new Date();

      // Add message to subcollection
      await addDoc(messagesCol, {
        senderId,
        senderName,
        senderAvatar,
        text: text.trim(),
        createdAt: now,
        readBy: [],
      });

      // Update conversation's last message
      await updateDoc(conversationRef, {
        lastMessage: text.trim(),
        lastMessageTime: now,
        updatedAt: now,
      });

      // Get conversation to find recipient
      const conversationSnap = await getDoc(conversationRef);
      if (conversationSnap.exists()) {
        const data = conversationSnap.data();
        const participantIds = data.participantIds ?? [];
        const recipientId = participantIds.find((id: string) => id !== senderId);

        // Trigger notification to recipient
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
            // Don't throw — message was sent successfully, notification is bonus
          }
        }
      }

      console.log('[messagingService] Message sent successfully');
    } catch (error) {
      console.error('[messagingService.sendMessage] Error:', error);
      throw new Error('Failed to send message');
    }
  },

  /**
   * Real-time listener for messages in a conversation.
   *
   * LOGIC:
   * 1. Set up onSnapshot listener on messages subcollection
   * 2. Order by createdAt (oldest first)
   * 3. Call callback whenever messages change
   * 4. Return unsubscribe function for cleanup
   *
   * SIDE EFFECTS:
   * - Opens a real-time listener (consumes Firestore quota)
   * - Callback called immediately with initial data, then on each update
   *
   * @param conversationId - conversation ID
   * @param callback - called with updated messages array
   * @returns Function to unsubscribe from listener
   */
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
        callback([]); // Fail gracefully
      }
    );
  },

  /**
   * Real-time listener for all conversations for a user.
   *
   * LOGIC:
   * 1. Query conversations where user is in participantIds
   * 2. Set up onSnapshot listener
   * 3. Sort by lastMessageTime (newest first)
   * 4. Call callback on each update
   *
   * SIDE EFFECTS:
   * - Opens a real-time listener
   * - Callback called immediately then on each update
   *
   * @param userId - user's UID
   * @param callback - called with updated conversations array
   * @returns Function to unsubscribe from listener
   */
  listenToConversations(
    userId: string,
    callback: (conversations: Conversation[]) => void
  ): Unsubscribe {
    const q = query(conversationsCol, where('participantIds', 'array-contains', userId));

    return onSnapshot(
      q,
      (snap) => {
        const conversations = sortConversations(snap.docs.map(docToConversation));
        callback(conversations);
      },
      (error) => {
        console.error('[messagingService] Conversations listener error:', error);
        callback([]); // Fail gracefully
      }
    );
  },

  /**
   * Fetch a single conversation by ID (one-time fetch, not real-time).
   *
   * USE CASES:
   * - Loading a conversation when you have its ID
   * - Fallback when real-time listener is unavailable
   * - Checking if conversation exists
   *
   * @param conversationId - conversation ID
   * @returns Promise<Conversation | null> - conversation or null if not found
   */
  async fetchConversation(conversationId: string): Promise<Conversation | null> {
    try {
      const conversationRef = doc(conversationsCol, conversationId);
      const snap = await getDoc(conversationRef);

      if (snap.exists()) {
        return docToConversation(snap);
      }
      return null;
    } catch (error) {
      console.error('[messagingService.fetchConversation] Error:', error);
      throw error;
    }
  },

  /**
   * Fetch all messages in a conversation (one-time fetch, not real-time).
   *
   * USE CASES:
   * - Loading message history when opening a conversation
   * - Fallback when real-time listener fails
   *
   * @param conversationId - conversation ID
   * @param limitCount - max messages to fetch (default: 50)
   * @returns Promise<Message[]> - messages sorted oldest first
   */
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

  /**
   * Mark a message as read by the current user.
   *
   * LOGIC:
   * 1. Add current user ID to message's readBy array
   * 2. Prevents duplicates by checking if already in array
   *
   * @param conversationId - conversation ID
   * @param messageId - message ID
   * @param userId - user ID to mark as reader
   * @returns Promise<void>
   */
  async markMessageAsRead(
    conversationId: string,
    messageId: string,
    userId: string
  ): Promise<void> {
    try {
      const conversationRef = doc(conversationsCol, conversationId);
      const messageRef = doc(collection(conversationRef, 'messages'), messageId);

      // Get current message to check if already read
      const messageSnap = await getDoc(messageRef);
      if (messageSnap.exists()) {
        const data = messageSnap.data();
        const readBy = data.readBy ?? [];

        // Only update if not already marked as read
        if (!readBy.includes(userId)) {
          await updateDoc(messageRef, {
            readBy: [...readBy, userId],
          });
        }
      }
    } catch (error) {
      console.error('[messagingService.markMessageAsRead] Error:', error);
      // Don't throw — this is non-critical
    }
  },

  /**
   * Delete a conversation and all its messages.
   *
   * LOGIC:
   * 1. Query all messages in conversation
   * 2. Delete each message (can't delete subcollections directly)
   * 3. Delete conversation document
   *
   * SIDE EFFECTS:
   * - Performs batch delete
   * - Removes conversation from both users' lists
   *
   * @param conversationId - conversation ID
   * @returns Promise<void>
   */
  async deleteConversation(conversationId: string): Promise<void> {
    try {
      const conversationRef = doc(conversationsCol, conversationId);
      const messagesCol = collection(conversationRef, 'messages');

      // Delete all messages in conversation
      const messagesSnap = await getDocs(messagesCol);
      const batch = writeBatch(db);

      messagesSnap.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      // Delete conversation
      batch.delete(conversationRef);

      await batch.commit();
      console.log('[messagingService] Conversation deleted:', conversationId);
    } catch (error) {
      console.error('[messagingService.deleteConversation] Error:', error);
      throw new Error('Failed to delete conversation');
    }
  },
};