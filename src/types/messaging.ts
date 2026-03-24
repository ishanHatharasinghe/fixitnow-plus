// ─── Messaging Types ────────────────────────────────────────────────────────

export type UserRole = 'admin' | 'seeker' | 'serviceProvider';

export interface ConversationParticipant {
  name: string;
  avatar: string;
  role: UserRole;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  participants: Record<string, ConversationParticipant>;
  lastMessage: string;
  lastMessageTime: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  read: boolean;
  createdAt: Date;
}

export interface CreateConversationPayload {
  participantIds: string[];
  participants: Record<string, ConversationParticipant>;
}

export interface SendMessagePayload {
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
}