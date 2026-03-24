/**
 * MessageButton.tsx (UPDATED)
 *
 * Component to start a 1-on-1 conversation with a service provider.
 * This is the entry point from a profile page to the messaging system.
 *
 * LOGIC FLOW:
 * 1. User clicks "Message" button on service provider's profile
 * 2. Get current user and service provider details
 * 3. Call getOrCreateConversation() — creates new or fetches existing
 * 4. Show DirectChatModal with the conversation ID
 * 5. DirectChatModal renders the actual chat interface
 *
 * KEY FEATURES:
 * - Prevents messaging yourself
 * - Requires authentication
 * - Reuses existing conversation if one already exists
 * - Error handling with user feedback
 */

import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useMessaging } from '../contexts/MessagingContext';
import { messagingService, type ConversationParticipant } from '../services/messagingService';
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
  const [conversationId, setConversationId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleClick = async () => {
    // Validation checks
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
      // Get current user's full profile for participant info
      const currentUserProfile = await userService.getUser(currentUser.uid);
      if (!currentUserProfile) {
        setError('Failed to load your profile');
        setLoading(false);
        return;
      }

      // Build current user participant data
      const currentUserData: ConversationParticipant = {
        name: currentUserProfile.displayName || currentUser.email || 'User',
        avatar: currentUserProfile.profilePicture,
        role: currentUserProfile.role,
      };

      // Build service provider participant data
      const serviceProviderData: ConversationParticipant = {
        name: serviceProviderName,
        avatar: serviceProviderAvatar,
        role: serviceProviderRole,
      };

      // Get or create conversation
      const newConversationId = await messagingService.getOrCreateConversation(
        currentUser.uid,
        serviceProviderId,
        currentUserData,
        serviceProviderData
      );

      setConversationId(newConversationId);
      
      // Select the conversation in the messaging context
      await selectConversation(newConversationId);
      
      // Show the modal
      setShowDirectChat(true);

      console.log('[MessageButton] Conversation ready:', newConversationId);
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
    secondary: 'bg-white text-[#0072D1] border-2 border-[#0072D1] hover:bg-[#0072D1] hover:text-white',
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={loading}
        className={`relative overflow-hidden flex items-center gap-2 font-bold rounded-xl transition-all duration-300 hover:scale-105 group shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses[size]} ${variantClasses[variant]}`}
        title={error ? error : 'Send a message'}
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

      {conversationId && (
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