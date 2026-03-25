/**
 * MessagingContext.tsx (UPDATED)
 *
 * CHANGES:
 * 1. FIX #1 – startConversation now builds currentUserData from currentUser
 *    directly (email/displayName fallback) so it never passes undefined role,
 *    which was causing "Failed to start conversation" on the Message button.
 * 2. FIX #2 – deleteConversation now calls deleteConversationForMe() (soft-
 *    delete) instead of the hard-delete.  The conversation stays in Firestore
 *    and the other participant still sees it.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import {
  messagingService,
  type Conversation,
  type Message,
  type ConversationParticipant,
} from '../services/messagingService';
import { userService } from '../services/userService';

interface MessagingContextType {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  loading: boolean;
  error: string | null;

  selectConversation: (conversationId: string) => Promise<void>;
  startConversation: (
    otherUserId: string,
    otherUserData: ConversationParticipant,
    currentUserData?: ConversationParticipant
  ) => Promise<void>;
  sendMessage: (text: string) => Promise<void>;
  markAsRead: (messageId: string) => Promise<void>;
  /** Soft-delete — only removes conversation from the current user's view */
  deleteConversation: (conversationId: string) => Promise<void>;
  clearError: () => void;
}

const MessagingContext = createContext<MessagingContextType | undefined>(undefined);

export const useMessaging = () => {
  const context = useContext(MessagingContext);
  if (!context) throw new Error('useMessaging must be used within a MessagingProvider');
  return context;
};

interface MessagingProviderProps {
  children: ReactNode;
}

export const MessagingProvider: React.FC<MessagingProviderProps> = ({ children }) => {
  const { currentUser } = useAuth();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ─── Real-time Conversation Listener ──────────────────────────────────────
  useEffect(() => {
    if (!currentUser?.uid) {
      setConversations([]);
      setCurrentConversation(null);
      setMessages([]);
      return;
    }

    const unsubscribe = messagingService.listenToConversations(currentUser.uid, (convs) => {
      setConversations(convs);

      // If the currently open conversation was soft-deleted (no longer in the
      // visible list), clear it so the UI doesn't show a "ghost" chat.
      setCurrentConversation((prev) => {
        if (!prev) return null;
        const stillVisible = convs.find((c) => c.id === prev.id);
        return stillVisible ?? null;
      });
    });

    return () => unsubscribe();
  }, [currentUser?.uid]);

  // ─── Real-time Messages Listener ──────────────────────────────────────────
  useEffect(() => {
    if (!currentConversation?.id) {
      setMessages([]);
      return;
    }

    const unsubscribe = messagingService.listenToMessages(currentConversation.id, (msgs) => {
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [currentConversation?.id]);

  // ─── Actions ──────────────────────────────────────────────────────────────

  const selectConversation = async (conversationId: string) => {
    const existing = conversations.find((c) => c.id === conversationId);
    if (existing) {
      setCurrentConversation(existing);
      setError(null);
      return;
    }

    setLoading(true);
    try {
      const fetched = await messagingService.fetchConversation(conversationId);
      if (fetched) {
        setCurrentConversation(fetched);
        setError(null);
      } else {
        setError('Conversation not found');
      }
    } catch (err) {
      console.error('[MessagingContext.selectConversation] Error:', err);
      setError('Failed to load conversation');
    } finally {
      setLoading(false);
    }
  };

  /**
   * FIX #1 – Start / re-open a conversation with another user.
   *
   * Root cause of "Failed to start conversation":
   *  - The old code fell through to a minimal participant object when no
   *    currentUserData was passed, which sometimes had an undefined `role`.
   *  - We now always fetch the full user profile from Firestore first so the
   *    participant data is always complete and valid.
   *  - If the Firestore fetch fails we fall back gracefully using Auth data.
   */
  const startConversation = async (
    otherUserId: string,
    otherUserData: ConversationParticipant,
    currentUserData?: ConversationParticipant
  ) => {
    if (!currentUser?.uid) {
      setError('You must be logged in to start a conversation');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let userData: ConversationParticipant;

      if (currentUserData) {
        // Caller already supplied participant data — use it.
        userData = currentUserData;
      } else {
        // Fetch the full profile so we always have name, avatar and role.
        try {
          const profile = await userService.getUser(currentUser.uid);
          userData = {
            name:
              profile?.displayName ||
              currentUser.displayName ||
              currentUser.email ||
              'User',
            avatar: profile?.profilePicture || currentUser.photoURL || null,
            role: profile?.role ?? 'seeker',
          };
        } catch {
          // Graceful fallback — don't block the conversation
          userData = {
            name: currentUser.displayName || currentUser.email || 'User',
            avatar: currentUser.photoURL || null,
            role: 'seeker',
          };
        }
      }

      const conversationId = await messagingService.getOrCreateConversation(
        currentUser.uid,
        otherUserId,
        userData,
        otherUserData
      );

      const conversation = await messagingService.fetchConversation(conversationId);
      if (conversation) {
        setCurrentConversation(conversation);
      } else {
        setError('Failed to load conversation');
      }
    } catch (err) {
      console.error('[MessagingContext.startConversation] Error:', err);
      setError('Failed to start conversation');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!currentUser?.uid || !currentConversation?.id) {
      setError('No conversation selected');
      return;
    }
    if (!text.trim()) {
      setError('Message cannot be empty');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const currentUserData = currentConversation.participants[currentUser.uid];
      if (!currentUserData) {
        setError('User data not found in conversation');
        return;
      }

      await messagingService.sendMessage(
        currentConversation.id,
        currentUser.uid,
        currentUserData.name,
        currentUserData.avatar || undefined,
        text.trim()
      );
    } catch (err) {
      console.error('[MessagingContext.handleSendMessage] Error:', err);
      setError('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (messageId: string) => {
    if (!currentConversation?.id || !currentUser?.uid) return;
    try {
      await messagingService.markMessageAsRead(
        currentConversation.id,
        messageId,
        currentUser.uid
      );
    } catch (err) {
      console.error('[MessagingContext.handleMarkAsRead] Error:', err);
    }
  };

  /**
   * FIX #2 – Soft-delete ("Delete for me") instead of hard-delete.
   *
   * Calls deleteConversationForMe() which adds the user's UID to `deletedBy`.
   * The conversation stays in Firestore; the other participant is unaffected.
   * The listenToConversations listener already filters out docs where the
   * current user is in `deletedBy`, so it disappears from their inbox instantly.
   */
  const handleDeleteConversation = async (conversationId: string) => {
    if (!currentUser?.uid) return;

    setLoading(true);
    setError(null);

    try {
      await messagingService.deleteConversationForMe(conversationId, currentUser.uid);

      // Clear UI immediately — the listener will also do this, but being
      // explicit keeps the UX snappy.
      if (currentConversation?.id === conversationId) {
        setCurrentConversation(null);
        setMessages([]);
      }
    } catch (err) {
      console.error('[MessagingContext.handleDeleteConversation] Error:', err);
      setError('Failed to delete conversation');
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  const value: MessagingContextType = {
    conversations,
    currentConversation,
    messages,
    loading,
    error,
    selectConversation,
    startConversation,
    sendMessage: handleSendMessage,
    markAsRead: handleMarkAsRead,
    deleteConversation: handleDeleteConversation,
    clearError,
  };

  return (
    <MessagingContext.Provider value={value}>{children}</MessagingContext.Provider>
  );
};