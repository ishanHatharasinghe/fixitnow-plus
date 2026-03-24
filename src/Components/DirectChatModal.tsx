/**
 * DirectChatModal.tsx (UPDATED)
 *
 * Floating chat modal (like WhatsApp Web or Messenger).
 * Appears in bottom-right corner with conversation thread.
 *
 * FEATURES:
 * - Displays messages in real-time
 * - Send message with Enter key or button
 * - Shows other participant's avatar and name
 * - Auto-loads conversation on mount
 * - Closes with X button
 *
 * KEY DESIGN:
 * - Uses messagingService for all data operations
 * - Reads current conversation from MessagingContext
 * - No local state for messages (always up-to-date via listener)
 */

import React, { useState } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
import { useMessaging } from '../contexts/MessagingContext';
import { useAuth } from '../hooks/useAuth';

interface DirectChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId: string;
}

const DirectChatModal: React.FC<DirectChatModalProps> = ({ isOpen, onClose, conversationId }) => {
  const { currentConversation, messages, sendMessage, selectConversation, loading } = useMessaging();
  const { currentUser } = useAuth();
  const [messageText, setMessageText] = useState('');

  // ─── Load conversation on mount ────────────────────────────────────────────
  /**
   * LOGIC:
   * 1. When modal opens with conversationId
   * 2. If it's not already the current conversation, select it
   * 3. This triggers the messages listener to load messages
   */
  React.useEffect(() => {
    if (isOpen && conversationId && currentConversation?.id !== conversationId) {
      selectConversation(conversationId);
    }
  }, [isOpen, conversationId, currentConversation?.id, selectConversation]);

  if (!isOpen || !currentConversation) return null;

  // ─── Message sending ──────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!messageText.trim()) return;
    
    try {
      await sendMessage(messageText);
      setMessageText(''); // Clear input on success
    } catch (err) {
      console.error('[DirectChatModal] Error sending message:', err);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ─── Find other participant ────────────────────────────────────────────────
  /**
   * Get the participant who is NOT the current user.
   * Used for displaying header info (name, avatar, role).
   */
  const otherParticipant = Object.values(currentConversation.participants).find(
    (p) => p.name !== currentUser?.displayName
  );

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
        {/* ─── Header ─────────────────────────────────────────────────────── */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-[#0072D1] text-white rounded-t-2xl">
          <div className="flex items-center gap-3">
            {otherParticipant?.avatar ? (
              <img
                src={otherParticipant.avatar}
                alt={otherParticipant.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-sm">{otherParticipant?.name || 'User'}</h3>
              <p className="text-xs opacity-90 capitalize">{otherParticipant?.role}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Close chat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ─── Messages List ──────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-xs font-medium">No messages yet</p>
              <p className="text-xs text-gray-400">Send the first message!</p>
            </div>
          ) : (
            messages.map((message) => {
              const isOwnMessage = message.senderId === currentUser?.uid;
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-3 py-2 rounded-2xl text-sm ${
                      isOwnMessage
                        ? 'bg-[#0072D1] text-white'
                        : 'bg-white text-gray-900 border border-gray-200'
                    }`}
                  >
                    <p className="break-words">{message.text}</p>
                    <p
                      className={`text-xs mt-1 ${
                        isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                      }`}
                    >
                      {message.createdAt?.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ─── Message Input ──────────────────────────────────────────────── */}
        <div className="p-3 border-t border-gray-200 bg-white">
          <div className="flex gap-2">
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              disabled={loading}
              className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0072D1]/20 focus:border-[#0072D1] disabled:bg-gray-100 disabled:cursor-not-allowed"
              maxLength={1000}
            />
            <button
              onClick={handleSend}
              disabled={!messageText.trim() || loading}
              className="w-8 h-8 bg-[#0072D1] text-white rounded-full flex items-center justify-center hover:bg-[#0056A3] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DirectChatModal;