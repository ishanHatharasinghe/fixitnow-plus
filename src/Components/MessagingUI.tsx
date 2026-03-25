import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, X, Send, Trash2, ChevronLeft, Search, User } from 'lucide-react';
import { useMessaging } from '../contexts/MessagingContext';
import { useAuth } from '../hooks/useAuth';

/* ─── Inject global styles ──────────────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

  .msg-root * { box-sizing: border-box; font-family: 'Plus Jakarta Sans', sans-serif; }

  /* ── Overlay ── */
  .msg-overlay {
    position: fixed; inset: 0; z-index: 50;
    display: flex; align-items: center; justify-content: center;
    padding: 0;
    background: rgba(15,15,30,0.55);
    backdrop-filter: blur(8px);
    animation: overlayIn 0.25s ease;
  }
  @media (min-width: 640px) {
    .msg-overlay { padding: 1rem; }
  }
  @keyframes overlayIn { from { opacity:0 } to { opacity:1 } }

  /* ── Shell ── */
  .msg-shell {
    background: #F7F6F3;
    border-radius: 0;
    box-shadow: 0 32px 80px rgba(0,0,0,0.22), 0 0 0 1px rgba(255,255,255,0.6);
    overflow: hidden;
    display: flex;
    animation: shellIn 0.3s cubic-bezier(.34,1.4,.64,1);
    width: 100%;
    /* Full screen on mobile */
    height: 100dvh;
    max-width: 100%;
    max-height: 100dvh;
  }
  @supports not (height: 100dvh) {
    .msg-shell { height: 100vh; max-height: 100vh; }
  }
  @media (min-width: 640px) {
    .msg-shell {
      border-radius: 24px;
      height: 82vh;
      max-height: 700px;
    }
  }
  @keyframes shellIn { from { opacity:0; transform:scale(.94) translateY(12px) } to { opacity:1; transform:none } }

  /* ── Sidebar ── */
  .msg-sidebar {
    width: 100%;
    background: #FFFFFF;
    border-right: none;
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
  }
  @media (min-width: 640px) {
    .msg-sidebar {
      width: 280px;
      border-right: 1.5px solid #EDECE9;
    }
  }
  @media (min-width: 768px) {
    .msg-sidebar { width: 300px; }
  }

  .msg-sidebar-header {
    padding: 16px 16px 14px;
    border-bottom: 1.5px solid #EDECE9;
  }
  @media (min-width: 640px) {
    .msg-sidebar-header { padding: 20px 20px 16px; }
  }

  .msg-sidebar-title {
    font-size: 18px;
    font-weight: 700;
    color: #18181B;
    letter-spacing: -0.4px;
    margin: 0 0 12px;
  }
  @media (min-width: 640px) {
    .msg-sidebar-title { font-size: 20px; margin: 0 0 14px; }
  }

  .msg-search-wrap {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #F4F3F0;
    border-radius: 12px;
    padding: 9px 12px;
  }
  .msg-search-wrap svg { color: #A8A49E; flex-shrink:0; }
  .msg-search-wrap input {
    border: none; background: transparent; outline: none;
    font-size: 13px; color: #18181B; width: 100%;
    font-family: inherit;
  }
  .msg-search-wrap input::placeholder { color: #B0ABA4; }

  .msg-sidebar-list { flex:1; overflow-y:auto; padding: 8px 0; }
  .msg-sidebar-list::-webkit-scrollbar { width: 0; }

  .msg-conv-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
    cursor: pointer;
    position: relative;
    transition: background 0.15s;
    margin: 2px 6px;
    border-radius: 14px;
  }
  @media (min-width: 640px) {
    .msg-conv-item { padding: 12px 16px; margin: 2px 8px; }
  }
  .msg-conv-item:hover { background: #F4F3F0; }
  .msg-conv-item.active {
    background: linear-gradient(135deg, #FFF5EC 0%, #FFF0E8 100%);
    box-shadow: inset 3px 0 0 #FF7A35;
  }

  .msg-conv-avatar {
    width: 44px; height: 44px; border-radius: 50%;
    object-fit: cover;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    flex-shrink: 0;
  }
  @media (min-width: 640px) {
    .msg-conv-avatar { width: 46px; height: 46px; }
  }

  .msg-conv-info { flex:1; min-width:0; }
  .msg-conv-name {
    font-size: 14px; font-weight: 600; color: #18181B;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    letter-spacing: -0.2px;
  }
  .msg-conv-preview {
    font-size: 12.5px; color: #9C9791;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    margin-top: 2px;
  }
  .msg-conv-meta {
    display: flex; flex-direction: column; align-items: flex-end; gap: 4px;
    flex-shrink: 0;
  }
  .msg-conv-time { font-size: 11px; color: #C0BAB3; }

  /* Action buttons — always visible on mobile (no hover), hover on desktop */
  .msg-conv-actions {
    display: flex;
    gap: 2px;
    opacity: 1;
    transition: opacity 0.15s;
  }
  @media (min-width: 640px) {
    .msg-conv-actions { opacity: 0; }
    .msg-conv-item:hover .msg-conv-actions { opacity: 1; }
  }

  .msg-conv-action-btn {
    background: none; border: none; cursor: pointer; padding: 5px;
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    color: #C0BAB3;
    transition: color 0.15s, background 0.15s;
  }
  .msg-conv-action-btn:hover { background: #EDECE9; }
  .msg-conv-action-btn.delete:hover { color: #EF4444; }
  .msg-conv-action-btn.view-profile:hover { color: #FF7A35; }

  .msg-empty {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; gap: 8px;
    padding: 48px 24px; text-align: center; color: #C0BAB3;
  }
  .msg-empty-icon {
    width: 52px; height: 52px; background: #F4F3F0;
    border-radius: 50%; display: flex; align-items:center; justify-content:center;
    margin-bottom: 4px;
  }
  .msg-empty p { margin:0; font-size:13px; }
  .msg-empty p:first-of-type { color: #7A746C; font-weight:600; font-size:14px; }

  /* ── Chat area ── */
  .msg-chat { flex:1; display:flex; flex-direction:column; min-width:0; }

  .msg-chat-header {
    padding: 12px 14px;
    background: #FFFFFF;
    border-bottom: 1.5px solid #EDECE9;
    display: flex; align-items: center; justify-content: space-between;
    gap: 8px;
    min-height: 60px;
  }
  @media (min-width: 640px) {
    .msg-chat-header { padding: 16px 20px; gap: 12px; min-height: auto; }
  }

  .msg-chat-header-left { display: flex; align-items: center; gap: 8px; min-width: 0; flex: 1; }
  @media (min-width: 640px) {
    .msg-chat-header-left { gap: 12px; }
  }

  .msg-back-btn {
    background: #F4F3F0; border: none; border-radius: 10px;
    width: 34px; height: 34px; min-width: 34px;
    display: flex; align-items:center; justify-content:center;
    cursor:pointer; color: #7A746C; transition: background 0.15s;
  }
  @media (min-width: 640px) {
    .msg-back-btn { border-radius: 12px; width: 36px; height: 36px; min-width: 36px; }
  }
  .msg-back-btn:hover { background: #EDECE9; }

  .msg-chat-avatar {
    width: 36px; height: 36px; border-radius: 50%; object-fit:cover;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    flex-shrink: 0;
  }
  @media (min-width: 640px) {
    .msg-chat-avatar { width: 42px; height: 42px; }
  }

  .msg-chat-name {
    font-size: 14px; font-weight: 700; color: #18181B; letter-spacing: -0.3px;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  @media (min-width: 640px) {
    .msg-chat-name { font-size: 15px; }
  }
  .msg-chat-role {
    font-size: 11px; color: #FF7A35; font-weight: 600; text-transform: uppercase;
    letter-spacing: 0.3px;
  }
  @media (min-width: 640px) {
    .msg-chat-role { font-size: 12px; }
  }

  .msg-close-btn {
    background: #F4F3F0; border: none; border-radius: 10px;
    width: 34px; height: 34px; min-width: 34px;
    display: flex; align-items:center; justify-content:center;
    cursor:pointer; color: #7A746C; transition: background 0.15s;
    flex-shrink: 0;
  }
  @media (min-width: 640px) {
    .msg-close-btn { border-radius: 12px; width: 36px; height: 36px; min-width: 36px; }
  }
  .msg-close-btn:hover { background: #EDECE9; color: #18181B; }

  /* ── Header action buttons ── */
  .msg-header-actions {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
  }

  /* On mobile: icon-only buttons, no text */
  .msg-header-action-btn {
    display: flex; align-items: center; justify-content: center;
    gap: 0;
    padding: 8px;
    border: 1.5px solid #EDECE9;
    border-radius: 10px;
    background: #FAFAF8;
    font-size: 12px; font-weight: 600;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s, color 0.15s;
    font-family: 'Plus Jakarta Sans', sans-serif;
    white-space: nowrap;
  }
  .msg-header-action-btn .msg-btn-label { display: none; }
  @media (min-width: 640px) {
    .msg-header-action-btn {
      gap: 6px;
      padding: 7px 12px;
      border-radius: 12px;
    }
    .msg-header-action-btn .msg-btn-label { display: inline; }
  }

  .msg-header-action-btn.delete { color: #9C9791; }
  .msg-header-action-btn.delete:hover {
    background: #FEF2F2; border-color: #FECACA; color: #EF4444;
  }
  .msg-header-action-btn.view-profile {
    color: #FF7A35;
    border-color: #FFD5BC;
    background: #FFF5EC;
  }
  .msg-header-action-btn.view-profile:hover {
    background: #FF7A35; border-color: #FF7A35; color: #fff;
  }

  /* Messages list */
  .msg-list {
    flex: 1; overflow-y: auto; padding: 14px;
    display: flex; flex-direction: column; gap: 10px;
    background: #F7F6F3;
  }
  @media (min-width: 640px) {
    .msg-list { padding: 20px; gap: 12px; }
  }
  .msg-list::-webkit-scrollbar { width: 4px; }
  .msg-list::-webkit-scrollbar-thumb { background: #DDD9D3; border-radius: 99px; }

  .msg-bubble-row { display: flex; }
  .msg-bubble-row.own { justify-content: flex-end; }
  .msg-bubble-row.other { justify-content: flex-start; }

  .msg-bubble {
    max-width: min(80%, 340px);
    padding: 10px 14px;
    border-radius: 18px;
    position: relative;
    animation: bubbleIn 0.2s cubic-bezier(.34,1.3,.64,1);
  }
  @media (min-width: 640px) {
    .msg-bubble { max-width: min(68%, 380px); padding: 11px 16px; border-radius: 20px; }
  }
  @keyframes bubbleIn { from { opacity:0; transform: scale(.9) } to { opacity:1; transform:none } }

  .msg-bubble.own {
    background: linear-gradient(135deg, #FF7A35 0%, #FF5A00 100%);
    color: #fff;
    border-bottom-right-radius: 5px;
    box-shadow: 0 4px 16px rgba(255,122,53,0.35);
  }
  .msg-bubble.other {
    background: #FFFFFF;
    color: #18181B;
    border-bottom-left-radius: 5px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.06);
  }
  .msg-bubble-text { font-size: 14px; line-height: 1.5; margin: 0; word-break: break-word; }
  .msg-bubble-time { font-size: 10.5px; margin-top: 4px; display: block; }
  .msg-bubble.own .msg-bubble-time { color: rgba(255,255,255,0.65); text-align: right; }
  .msg-bubble.other .msg-bubble-time { color: #B0ABA4; }

  .msg-no-msgs {
    display: flex; flex-direction: column; align-items:center;
    justify-content:center; flex:1; gap: 8px; color:#C0BAB3;
    padding: 40px 20px;
  }

  /* Input area */
  .msg-input-area {
    padding: 12px 14px;
    background: #FFFFFF;
    border-top: 1.5px solid #EDECE9;
    /* Prevent content from going under mobile keyboard */
    padding-bottom: max(12px, env(safe-area-inset-bottom));
  }
  @media (min-width: 640px) {
    .msg-input-area { padding: 16px 20px; }
  }

  .msg-error {
    display: flex; align-items:center; justify-content:space-between;
    background: #FEF2F2; border: 1px solid #FECACA;
    border-radius: 12px; padding: 10px 14px; margin-bottom: 10px;
    font-size: 13px; color: #DC2626;
  }
  .msg-error-close {
    background:none; border:none; cursor:pointer; color:#EF9999;
    display:flex; padding:0; transition:color 0.15s;
  }
  .msg-error-close:hover { color: #DC2626; }

  .msg-input-row { display: flex; gap: 8px; align-items: flex-end; }
  @media (min-width: 640px) {
    .msg-input-row { gap: 10px; }
  }

  .msg-textarea {
    flex:1; resize:none; border: 1.5px solid #E8E5E0;
    border-radius: 14px; padding: 10px 14px;
    font-size: 14px; color: #18181B; outline: none;
    font-family: 'Plus Jakarta Sans', sans-serif;
    line-height: 1.5; max-height: 90px;
    transition: border-color 0.2s, box-shadow 0.2s;
    background: #FAFAF8;
    /* Prevent iOS zoom on focus */
    -webkit-text-size-adjust: 100%;
  }
  @media (min-width: 640px) {
    .msg-textarea { border-radius: 16px; padding: 11px 16px; max-height: 100px; }
  }
  .msg-textarea:focus {
    border-color: #FF7A35;
    box-shadow: 0 0 0 3px rgba(255,122,53,0.12);
    background: #FFFFFF;
  }
  .msg-textarea::placeholder { color: #C0BAB3; }
  .msg-textarea:disabled { opacity: 0.5; }

  .msg-send-btn {
    width: 42px; height: 42px; border-radius: 14px; border: none;
    background: linear-gradient(135deg, #FF7A35 0%, #FF5A00 100%);
    color: white; cursor: pointer; flex-shrink: 0;
    display: flex; align-items:center; justify-content:center;
    box-shadow: 0 4px 14px rgba(255,122,53,0.4);
    transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
  }
  @media (min-width: 640px) {
    .msg-send-btn { width: 46px; height: 46px; border-radius: 16px; }
  }
  .msg-send-btn:hover:not(:disabled) {
    transform: scale(1.06);
    box-shadow: 0 6px 20px rgba(255,122,53,0.5);
  }
  .msg-send-btn:active:not(:disabled) { transform: scale(0.95); }
  .msg-send-btn:disabled { opacity: 0.4; cursor: not-allowed; box-shadow:none; }

  /* No conversation selected */
  .msg-placeholder {
    flex:1; display:flex; align-items:center; justify-content:center;
    flex-direction:column; gap:12px; color: #C0BAB3;
    background: #F7F6F3;
    padding: 40px 24px;
  }
  .msg-placeholder-icon {
    width: 64px; height: 64px; border-radius: 20px;
    background: linear-gradient(135deg, #FFE8D9 0%, #FFD5BC 100%);
    display:flex; align-items:center; justify-content:center;
    margin-bottom: 4px;
  }
  @media (min-width: 640px) {
    .msg-placeholder-icon { width: 72px; height: 72px; border-radius: 24px; }
  }
  .msg-placeholder h3 { margin:0; font-size:16px; font-weight:700; color:#7A746C; letter-spacing:-0.3px; }
  @media (min-width: 640px) {
    .msg-placeholder h3 { font-size: 17px; }
  }
  .msg-placeholder p { margin:0; font-size:13px; max-width:200px; text-align:center; }

  /* Sidebar close btn */
  .msg-sidebar-close {
    background: #F4F3F0; border: none; border-radius: 10px;
    width: 32px; height: 32px; min-width: 32px;
    display: flex; align-items:center; justify-content:center;
    cursor:pointer; color: #7A746C; transition: background 0.15s;
    flex-shrink: 0;
  }
  .msg-sidebar-close:hover { background: #EDECE9; }

  /* Delete confirm */
  .msg-delete-confirm {
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    background: #fff;
    border-radius: 16px;
    padding: 16px 20px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.18);
    z-index: 10;
    width: calc(100% - 32px);
    max-width: 300px;
    text-align: center;
    border: 1.5px solid #EDECE9;
  }
  .msg-delete-confirm p {
    margin: 0 0 12px;
    font-size: 13px;
    color: #3F3B35;
    font-weight: 500;
  }
  .msg-delete-confirm-actions { display: flex; gap: 8px; }
  .msg-delete-confirm-actions button {
    flex: 1; padding: 9px 7px; border-radius: 10px; font-size: 13px;
    font-weight: 600; cursor: pointer; border: 1.5px solid transparent;
    font-family: 'Plus Jakarta Sans', sans-serif;
    transition: background 0.15s;
  }
  .msg-delete-cancel { background: #F4F3F0; color: #7A746C; border-color: #EDECE9 !important; }
  .msg-delete-cancel:hover { background: #EDECE9; }
  .msg-delete-ok { background: #EF4444; color: #fff; }
  .msg-delete-ok:hover { background: #DC2626; }
`;

function useInjectStyle(id: string, css: string) {
  useEffect(() => {
    if (document.getElementById(id)) return;
    const el = document.createElement('style');
    el.id = id;
    el.textContent = css;
    document.head.appendChild(el);
  }, []);
}

/* ─── Main Component ─────────────────────────────────────────────────────────── */
const MessagingUI: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  showSidebar?: boolean;
  initialConversationId?: string;
}> = ({ isOpen, onClose, showSidebar = true, initialConversationId }) => {
  useInjectStyle('msg-ui-styles', STYLES);
  const navigate = useNavigate();

  const {
    conversations,
    currentConversation,
    messages,
    loading,
    error,
    selectConversation,
    sendMessage,
    deleteConversation,
    clearError,
  } = useMessaging();
  const { currentUser } = useAuth();

  const [messageText, setMessageText] = useState('');
  const [isChatView, setIsChatView] = useState(false);
  const [search, setSearch] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && initialConversationId) {
      selectConversation(initialConversationId);
      if (showSidebar) setIsChatView(true);
    }
  }, [isOpen, initialConversationId]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  if (!isOpen) return null;

  const handleSelectConversation = async (id: string) => {
    await selectConversation(id);
    if (showSidebar) setIsChatView(true);
  };

  const handleSend = async () => {
    if (!messageText.trim()) return;
    await sendMessage(messageText);
    setMessageText('');
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleDeleteConfirmed = async (id: string) => {
    setConfirmDeleteId(null);
    await deleteConversation(id);
  };

  const filtered = conversations.filter((c) => {
    const ids = Object.keys(c.participants);
    const otherId = ids.find((id) => id !== currentUser?.uid) ?? ids[0];
    return c.participants[otherId]?.name?.toLowerCase().includes(search.toLowerCase());
  });

  // Derive the other participant from the current conversation
  const otherParticipantEntry = currentConversation
    ? Object.entries(currentConversation.participants).find(
        ([uid]) => uid !== currentUser?.uid
      )
    : null;
  const otherParticipantId = otherParticipantEntry?.[0];
  const otherParticipant = otherParticipantEntry?.[1];
  const isOtherServiceProvider = otherParticipant?.role === 'service_provider';

  const isWide = showSidebar && !isChatView;

  return (
    <div className="msg-root">
      <div
        className="msg-overlay"
        onClick={(e) => {
          if (shellRef.current && !shellRef.current.contains(e.target as Node)) {
            onClose();
          }
        }}
      >
        <div
          ref={shellRef}
          className="msg-shell"
          style={{
            maxWidth: isWide ? 900 : 640,
          }}
        >
          {/* ── Sidebar ── */}
          {showSidebar && !isChatView && (
            <div className="msg-sidebar">
              <div className="msg-sidebar-header">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <h2 className="msg-sidebar-title">Messages</h2>
                  <button className="msg-sidebar-close" onClick={onClose}>
                    <X size={16} />
                  </button>
                </div>
                <div className="msg-search-wrap">
                  <Search size={14} />
                  <input
                    placeholder="Search conversations…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="msg-sidebar-list">
                {filtered.length === 0 ? (
                  <div className="msg-empty">
                    <div className="msg-empty-icon">
                      <MessageSquare size={22} color="#C0BAB3" />
                    </div>
                    <p>No conversations yet</p>
                    <p style={{ color: '#C0BAB3' }}>Click "Message" on a profile to start</p>
                  </div>
                ) : (
                  filtered.map((conv) => (
                    <ConversationItem
                      key={conv.id}
                      conversation={conv}
                      isActive={currentConversation?.id === conv.id}
                      currentUserId={currentUser?.uid}
                      onClick={() => handleSelectConversation(conv.id)}
                      onDelete={() => setConfirmDeleteId(conv.id)}
                      onViewProfile={(providerId) =>
                        navigate(`/public-profile/${providerId}`)
                      }
                    />
                  ))
                )}
              </div>
            </div>
          )}

          {/* ── Chat area ── */}
          <div className="msg-chat" style={{ position: 'relative' }}>
            {/* Delete confirmation overlay */}
            {confirmDeleteId && (
              <div className="msg-delete-confirm">
                <p>Remove this chat from your inbox?<br />The other person can still see it.</p>
                <div className="msg-delete-confirm-actions">
                  <button className="msg-delete-cancel" onClick={() => setConfirmDeleteId(null)}>Cancel</button>
                  <button className="msg-delete-ok" onClick={() => handleDeleteConfirmed(confirmDeleteId)}>Delete for me</button>
                </div>
              </div>
            )}

            {currentConversation ? (
              <>
                {/* Header */}
                <div className="msg-chat-header">
                  <div className="msg-chat-header-left">
                    {showSidebar && isChatView && (
                      <button className="msg-back-btn" onClick={() => setIsChatView(false)}>
                        <ChevronLeft size={18} />
                      </button>
                    )}
                    {otherParticipant ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <img
                          src={otherParticipant.avatar || '/default-avatar.png'}
                          alt={otherParticipant.name}
                          className="msg-chat-avatar"
                        />
                        <div>
                          <div className="msg-chat-name">{otherParticipant.name}</div>
                          <div className="msg-chat-role">{otherParticipant.role?.replace('_', ' ')}</div>
                        </div>
                      </div>
                    ) : (
                      // Fallback: show all participants (shouldn't normally happen)
                      Object.values(currentConversation.participants).map((p: any, i: number) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <img src={p.avatar || '/default-avatar.png'} alt={p.name} className="msg-chat-avatar" />
                          <div>
                            <div className="msg-chat-name">{p.name}</div>
                            <div className="msg-chat-role">{p.role}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* ── Header action buttons ── */}
                  <div className="msg-header-actions">
                    {/* View Profile — only shown when the other participant is a service provider */}
                    {isOtherServiceProvider && otherParticipantId && (
                      <button
                        className="msg-header-action-btn view-profile"
                        onClick={() => navigate(`/public-profile/${otherParticipantId}`)}
                        title="View service provider's profile"
                      >
                        <User size={13} />
                        <span className="msg-btn-label">View Profile</span>
                      </button>
                    )}

                    {/* Delete for me */}
                    <button
                      className="msg-header-action-btn delete"
                      onClick={() => setConfirmDeleteId(currentConversation.id)}
                      title="Delete for me"
                    >
                      <Trash2 size={13} />
                      <span className="msg-btn-label">Delete</span>
                    </button>

                    {/* Close */}
                    {(!showSidebar || isChatView) && (
                      <button className="msg-close-btn" onClick={onClose}>
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <div className="msg-list" ref={listRef}>
                  {messages.length === 0 ? (
                    <div className="msg-no-msgs">
                      <div style={{ width: 48, height: 48, background: '#EDECE9', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <MessageSquare size={20} color="#C0BAB3" />
                      </div>
                      <p style={{ margin: 0, fontSize: 14, color: '#9C9791', fontWeight: 600 }}>No messages yet</p>
                      <p style={{ margin: 0, fontSize: 12, color: '#C0BAB3' }}>Say hello 👋</p>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <MessageBubble key={msg.id} message={msg} currentUserId={currentUser?.uid} />
                    ))
                  )}
                </div>

                {/* Input */}
                <div className="msg-input-area">
                  {error && (
                    <div className="msg-error">
                      <span>{error}</span>
                      <button className="msg-error-close" onClick={clearError}><X size={14} /></button>
                    </div>
                  )}
                  <div className="msg-input-row">
                    <textarea
                      className="msg-textarea"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyPress={handleKey}
                      placeholder="Write a message…"
                      rows={1}
                      disabled={loading}
                    />
                    <button
                      className="msg-send-btn"
                      onClick={handleSend}
                      disabled={loading || !messageText.trim()}
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="msg-placeholder">
                <div className="msg-placeholder-icon">
                  <MessageSquare size={32} color="#FF7A35" />
                </div>
                <h3>Your messages</h3>
                <p>Pick a conversation to start chatting</p>
                {showSidebar && !isChatView && (
                  // show close btn in placeholder state too
                  <button className="msg-close-btn" onClick={onClose} style={{ marginTop: 12 }}>
                    <X size={16} />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Conversation Item ────────────────────────────────────────────────────── */
const ConversationItem: React.FC<{
  conversation: any;
  isActive: boolean;
  currentUserId?: string;
  onClick: () => void;
  onDelete: () => void;
  onViewProfile: (participantId: string) => void;
}> = ({ conversation, isActive, currentUserId, onClick, onDelete, onViewProfile }) => {
  const ids = Object.keys(conversation.participants);
  const otherId = ids.find((id) => id !== currentUserId) ?? ids[0];
  const other = conversation.participants[otherId];
  const isServiceProvider = other?.role === 'service_provider';

  return (
    <div className={`msg-conv-item ${isActive ? 'active' : ''}`} onClick={onClick}>
      <img src={other?.avatar || '/default-avatar.png'} alt={other?.name} className="msg-conv-avatar" />
      <div className="msg-conv-info">
        <div className="msg-conv-name">{other?.name}</div>
        <div className="msg-conv-preview">{conversation.lastMessage || 'No messages yet'}</div>
      </div>
      <div className="msg-conv-meta">
        <span className="msg-conv-time">
          {conversation.lastMessageTime?.toLocaleDateString([], { month: 'short', day: 'numeric' })}
        </span>

        {/* Action buttons — appear on hover */}
        <div className="msg-conv-actions">
          {/* View Profile — only for service providers */}
          {isServiceProvider && (
            <button
              className="msg-conv-action-btn view-profile"
              title="View profile"
              onClick={(e) => {
                e.stopPropagation();
                onViewProfile(otherId);
              }}
            >
              <User size={13} />
            </button>
          )}

          {/* Delete for me */}
          <button
            className="msg-conv-action-btn delete"
            title="Delete for me"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Message Bubble ─────────────────────────────────────────────────────── */
const MessageBubble: React.FC<{ message: any; currentUserId?: string }> = ({ message, currentUserId }) => {
  const isOwn = message.senderId === currentUserId;
  return (
    <div className={`msg-bubble-row ${isOwn ? 'own' : 'other'}`}>
      <div className={`msg-bubble ${isOwn ? 'own' : 'other'}`}>
        <p className="msg-bubble-text">{message.text}</p>
        <span className="msg-bubble-time">
          {message.createdAt?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
};

export default MessagingUI;