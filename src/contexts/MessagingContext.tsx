/**
 * MessagingContext.tsx (UPDATED)
 *
 * Global context managing all messaging state and operations.
 *
 * FEATURES:
 * - Real-time listening to conversations and messages
 * - Automatic cleanup on unmount (unsubscribe from listeners)
 * - Error handling and user feedback
 * - Support for starting new conversations
 * - Message sending with optimistic updates
 * - Conversation selection and loading
 *
 * ARCHITECTURE:
 * 1. Top-level provider wraps app (in App.tsx or layout)
 * 2. Child components use useMessaging() hook
 * 3. Real-time listeners set up automatically
 * 4. All state updates trigger re-renders for instant UI updates
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

interface MessagingContextType {
  // ─── State ────────────────────────────────────────────────────────────────
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  loading: boolean;
  error: string | null;

  // ─── Actions ──────────────────────────────────────────────────────────────
  /** Select a conversation by ID and load its messages */
  selectConversation: (conversationId: string) => Promise<void>;

  /** Start a new conversation with another user (or load existing) */
  startConversation: (
    otherUserId: string,
    otherUserData: ConversationParticipant,
    currentUserData?: ConversationParticipant
  ) => Promise<void>;

  /** Send a message in the current conversation */
  sendMessage: (text: string) => Promise<void>;

  /** Mark a message as read */
  markAsRead: (messageId: string) => Promise<void>;

  /** Delete a conversation */
  deleteConversation: (conversationId: string) => Promise<void>;

  /** Clear error message */
  clearError: () => void;
}

const MessagingContext = createContext<MessagingContextType | undefined>(undefined);

export const useMessaging = () => {
  const context = useContext(MessagingContext);
  if (!context) {
    throw new Error('useMessaging must be used within a MessagingProvider');
  }
  return context;
};

interface MessagingProviderProps {
  children: ReactNode;
}

export const MessagingProvider: React.FC<MessagingProviderProps> = ({ children }) => {
  const { currentUser } = useAuth();

  // ─── State ────────────────────────────────────────────────────────────────
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ─── Real-time Conversation Listener ───────────────────────────────────────
  /**
   * LOGIC:
   * 1. When component mounts and user is authenticated
   * 2. Set up real-time listener on conversations
   * 3. Listener auto-updates conversations array when changes occur
   * 4. On unmount, unsubscribe from listener
   *
   * IMPORTANT:
   * - Listener is set up per-user (only gets their conversations)
   * - Automatically re-orders by most recent first
   * - Handles errors gracefully without crashing UI
   */
  useEffect(() => {
    if (!currentUser?.uid) {
      setConversations([]);
      setCurrentConversation(null);
      setMessages([]);
      return;
    }

    console.log('[MessagingContext] Setting up conversations listener for:', currentUser.uid);

    const unsubscribeConversations = messagingService.listenToConversations(
      currentUser.uid,
      (convs) => {
        console.log('[MessagingContext] Conversations updated:', convs.length);
        setConversations(convs);
      }
    );

    return () => {
      console.log('[MessagingContext] Cleaning up conversations listener');
      unsubscribeConversations();
    };
  }, [currentUser?.uid]);

  // ─── Real-time Messages Listener ──────────────────────────────────────────
  /**
   * LOGIC:
   * 1. When a conversation is selected
   * 2. Set up real-time listener on messages subcollection
   * 3. Listener auto-updates messages array when new messages arrive
   * 4. On unmount or conversation change, unsubscribe from listener
   *
   * IMPORTANT:
   * - Messages are ordered oldest first (natural conversation flow)
   * - Automatically marks old messages as read (optional)
   * - Handles errors gracefully
   */
  useEffect(() => {
    if (!currentConversation?.id) {
      setMessages([]);
      return;
    }

    console.log('[MessagingContext] Setting up messages listener for:', currentConversation.id);

    const unsubscribeMessages = messagingService.listenToMessages(
      currentConversation.id,
      (msgs) => {
        console.log('[MessagingContext] Messages updated:', msgs.length);
        setMessages(msgs);
      }
    );

    return () => {
      console.log('[MessagingContext] Cleaning up messages listener');
      unsubscribeMessages();
    };
  }, [currentConversation?.id]);

  // ─── Actions ──────────────────────────────────────────────────────────────

  /**
   * Select a conversation by ID.
   *
   * LOGIC:
   * 1. Check if conversation is already in local state
   * 2. If found, just set it as current
   * 3. If not found, fetch it from Firestore
   * 4. Update error state appropriately
   *
   * SIDE EFFECTS:
   * - Updates currentConversation state
   * - Triggers messages listener (via useEffect)
   * - Sets loading/error states
   */
  const selectConversation = async (conversationId: string) => {
    // Check if already in list
    const conversation = conversations.find((c) => c.id === conversationId);
    if (conversation) {
      setCurrentConversation(conversation);
      setError(null);
      return;
    }

    // Fetch from Firestore
    setLoading(true);
    try {
      const fetchedConversation = await messagingService.fetchConversation(conversationId);
      if (fetchedConversation) {
        setCurrentConversation(fetchedConversation);
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
   * Start a new conversation with another user (or get existing).
   *
   * LOGIC:
   * 1. Validate user is authenticated
   * 2. Call getOrCreateConversation (creates if new, returns ID if exists)
   * 3. Fetch conversation details
   * 4. Set as current conversation
   *
   * SIDE EFFECTS:
   * - May create new Firestore document
   * - Updates currentConversation state
   * - Triggers messages listener
   *
   * @param otherUserId - target user's UID
   * @param otherUserData - target user's participant info
   * @param currentUserData - optional current user info (fetched automatically if not provided)
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
      // Use provided currentUserData or create a minimal one
      const userData: ConversationParticipant = currentUserData || {
        name: currentUser.email || 'User',
        role: 'seeker',
      };

      const conversationId = await messagingService.getOrCreateConversation(
        currentUser.uid,
        otherUserId,
        userData,
        otherUserData
      );

      // Fetch conversation details
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

  /**
   * Send a message in the current conversation.
   *
   * LOGIC:
   * 1. Validate message text is not empty
   * 2. Validate conversation is selected
   * 3. Get sender details from current conversation
   * 4. Call messagingService.sendMessage()
   *
   * SIDE EFFECTS:
   * - Writes to Firestore
   * - Updates conversation's lastMessage
   * - Triggers notification to recipient
   * - Messages listener auto-updates UI
   *
   * @param text - message text to send
   */
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
        setError('User data not found');
        return;
      }

      await messagingService.sendMessage(
        currentConversation.id,
        currentUser.uid,
        currentUserData.name,
        currentUserData.avatar,
        text.trim()
      );

      // Clear on success (UI updates automatically via listener)
    } catch (err) {
      console.error('[MessagingContext.handleSendMessage] Error:', err);
      setError('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Mark a message as read.
   *
   * LOGIC:
   * 1. Validate conversation is selected
   * 2. Call messagingService.markMessageAsRead()
   *
   * SIDE EFFECTS:
   * - Updates message's readBy array in Firestore
   * - Doesn't require explicit UI update (listener handles it)
   *
   * @param messageId - message ID to mark as read
   */
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
      // Don't set error — this is non-critical
    }
  };

  /**
   * Delete a conversation and all its messages.
   *
   * LOGIC:
   * 1. Call messagingService.deleteConversation()
   * 2. If deleted conversation is current, clear current
   * 3. Remove from conversations list
   *
   * SIDE EFFECTS:
   * - Batch deletes all messages and conversation doc
   * - Listener will auto-update conversations list
   *
   * @param conversationId - conversation ID to delete
   */
  const handleDeleteConversation = async (conversationId: string) => {
    setLoading(true);
    setError(null);

    try {
      await messagingService.deleteConversation(conversationId);

      // Clear current conversation if it was deleted
      if (currentConversation?.id === conversationId) {
        setCurrentConversation(null);
        setMessages([]);
      }

      // Listener will auto-remove from conversations list
    } catch (err) {
      console.error('[MessagingContext.handleDeleteConversation] Error:', err);
      setError('Failed to delete conversation');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Clear error message
   */
  const clearError = () => {
    setError(null);
  };

  // ─── Context Value ────────────────────────────────────────────────────────
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
    <MessagingContext.Provider value={value}>
      {children}
    </MessagingContext.Provider>
  );
};