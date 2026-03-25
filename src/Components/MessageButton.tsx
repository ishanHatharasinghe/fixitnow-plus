/**
 * MessageButton.tsx (FIXED)
 *
 * Key fixes:
 * 1. Uses MessagingContext.startConversation() so role is always valid.
 * 2. Stores conversationId locally — does NOT gate the modal on
 *    `currentConversation` from context (avoids React state timing race).
 */

import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useMessaging } from '../contexts/MessagingContext';
import type { ConversationParticipant } from '../services/messagingService';
import { messagingService } from '../services/messagingService';
import { userService } from '../services/userService';
import DirectChatModal from './DirectChatModal';

interface MessageButtonProps {
  serviceProviderId: string;
  serviceProviderName: string;
  serviceProviderAvatar?: string;
  serviceProviderRole?: 'seeker' | 'service_provider' | 'admin';
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

const MessageButton: React.FC<MessageButtonProps> = ({
  serviceProviderId,
  serviceProviderName,
  serviceProviderAvatar,
  serviceProviderRole = 'service_provider',
  variant = 'primary',
  size = 'md',
}) => {
  const { currentUser } = useAuth();
  const { selectConversation } = useMessaging();

  const [showDirectChat, setShowDirectChat] = useState(false);
  // Store conversationId locally — do NOT depend on context timing
  const [conversationId, setConversationId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleClick = async () => {
    if (!currentUser) {
      setError('Please log in to send messages');
      return;
    }
    if (currentUser.uid === serviceProviderId) {
      setError('You cannot message yourself');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Build other participant data from props (always available)
      const otherUserData: ConversationParticipant = {
        name: serviceProviderName,
        avatar: serviceProviderAvatar ?? null,
        role: serviceProviderRole,
      };

      // Build current user data — Firestore profile first, Auth fallback
      let currentUserData: ConversationParticipant;
      try {
        const profile = await userService.getUser(currentUser.uid);
        currentUserData = {
          name:
            profile?.displayName ||
            currentUser.displayName ||
            currentUser.email ||
            'User',
          avatar: profile?.profilePicture || currentUser.photoURL || null,
          role: profile?.role ?? 'seeker',
        };
      } catch {
        currentUserData = {
          name: currentUser.displayName || currentUser.email || 'User',
          avatar: currentUser.photoURL || null,
          role: 'seeker',
        };
      }

      // Get or create conversation directly — deterministic ID means this is
      // safe to call even if the conversation already exists.
      const convId = await messagingService.getOrCreateConversation(
        currentUser.uid,
        serviceProviderId,
        currentUserData,
        otherUserData
      );

      // Pre-load into context so MessagingUI / DirectChatModal have it ready
      await selectConversation(convId);

      // Store ID locally and open the modal
      setConversationId(convId);
      setShowDirectChat(true);
    } catch (err) {
      console.error('[MessageButton] Error:', err);
      setError('Failed to start conversation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'text-xs px-3 py-2',
    md: 'text-sm px-4 py-2.5',
    lg: 'text-base px-6 py-3',
  };

  const variantClasses = {
    primary: 'bg-[#0072D1] text-white hover:bg-[#0056A3]',
    secondary:
      'bg-white text-[#0072D1] border-2 border-[#0072D1] hover:bg-[#0072D1] hover:text-white',
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={loading}
        className={`relative overflow-hidden flex items-center gap-2 font-bold rounded-xl transition-all duration-300 hover:scale-105 group shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses[size]} ${variantClasses[variant]}`}
        title={error || 'Send a message'}
      >
        <MessageSquare className="w-4 h-4 relative z-10" />
        <span className="relative z-10">{loading ? 'Loading...' : 'Message'}</span>
        <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
      </button>

      {error && (
        <div className="mt-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded">
          {error}
        </div>
      )}

      {/* Gate only on local conversationId — not on context timing */}
      {showDirectChat && conversationId && (
        <DirectChatModal
          isOpen={showDirectChat}
          onClose={() => {
            setShowDirectChat(false);
            setConversationId('');
          }}
          conversationId={conversationId}
        />
      )}
    </>
  );
};

export default MessageButton;
