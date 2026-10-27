import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import Avatar from '../common/Avatar';
import { formatConversationTime } from '../../utils/dateUtils';
import {
  Check,
  CheckCheck,
  Users,
  Image as ImageIcon,
  FileText,
  Ban,
  Phone,
  MoreVertical,
  Pin,
  PinOff,
  Archive,
  ArchiveRestore,
  Volume2,
  VolumeX,
  Mail,
  Trash2,
  X
} from 'lucide-react';

export default function ConversationItem({ conversation }) {
  const { user } = useAuth();
  const {
    activeConversation,
    selectConversation,
    onlinePresence,
    typingUsers,
    deleteChat,
    archiveChat,
    muteChat,
    pinChat,
    markChatUnread
  } = useChat();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const menuRef = useRef(null);

  const isSelected = activeConversation?.id === conversation.id;
  const isGroup = Boolean(conversation.is_group);
  const otherUser = conversation.other_user;

  // Online status
  let isOnline = false;
  if (!isGroup && otherUser) {
    const presence = onlinePresence[otherUser.id];
    isOnline = presence?.status === 'online' || otherUser.status === 'online';
  }

  // Title & Avatar
  const title = isGroup ? conversation.title : (otherUser?.name || otherUser?.phone || 'Contact');
  const avatarSrc = isGroup ? null : otherUser?.avatar;

  // Typing state for this conversation
  const activeTyping = typingUsers[conversation.id] || {};
  const typingNames = Object.values(activeTyping).map(u => u.name || u.phone || u.username);
  const isTyping = typingNames.length > 0;

  // Last message snippet
  const lastMsg = conversation.last_message;
  const isLastMsgOwn = lastMsg && lastMsg.sender_id === user?.id;

  const renderLastMessage = () => {
    if (isTyping) {
      return (
        <span className="text-[#3390ec] dark:text-[#5288c1] font-medium animate-pulse">
          typing...
        </span>
      );
    }

    if (!lastMsg) {
      if (!isGroup && otherUser?.phone) {
        return (
          <span className="text-xs text-[#3390ec] dark:text-[#5288c1] flex items-center gap-1 font-medium">
            <Phone className="w-3 h-3" />
            <span>{otherUser.phone}</span>
          </span>
        );
      }
      return <span className="italic text-zinc-400">No messages yet</span>;
    }

    if (lastMsg.is_deleted) {
      return (
        <span className="italic text-zinc-400 flex items-center gap-1">
          <Ban className="w-3 h-3" />
          <span>Message was deleted</span>
        </span>
      );
    }

    return (
      <span className="flex items-center gap-1">
        {isLastMsgOwn && (
          <span className="flex-shrink-0">
            {lastMsg.status === 'read' ? (
              <CheckCheck className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-[#3390ec] dark:text-[#5288c1]'} stroke-[2.5]`} />
            ) : lastMsg.status === 'delivered' ? (
              <CheckCheck className="w-3.5 h-3.5 text-zinc-400 stroke-[2]" />
            ) : (
              <Check className="w-3.5 h-3.5 text-zinc-400 stroke-[2]" />
            )}
          </span>
        )}

        {isGroup && !isLastMsgOwn && (
          <span className="font-semibold text-zinc-700 dark:text-zinc-300">
            {lastMsg.sender_name?.split(' ')[0]}:{' '}
          </span>
        )}

        {lastMsg.type === 'image' ? (
          <span className="flex items-center gap-1">
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Photo</span>
          </span>
        ) : lastMsg.type === 'file' ? (
          <span className="flex items-center gap-1">
            <FileText className="w-3.5 h-3.5" />
            <span>{lastMsg.file_name || 'Document'}</span>
          </span>
        ) : (
          <span className="truncate">{lastMsg.content}</span>
        )}
      </span>
    );
  };

  const timeStr = lastMsg?.created_at
    ? formatConversationTime(lastMsg.created_at)
    : formatConversationTime(conversation.created_at);

  const unreadCount = Number(conversation.unread_count) || 0;
  const isPinned = Boolean(conversation.is_pinned);
  const isMuted = Boolean(conversation.is_muted);
  const isArchived = Boolean(conversation.is_archived);

  // Trigger dropdown / action sheet with responsive boundary detection
  const handleOpenMenu = (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (window.innerWidth < 768) {
      setIsMobileSheetOpen(true);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const menuHeight = 220;
    const menuWidth = 195;

    let top = rect.bottom + 4;
    if (top + menuHeight > window.innerHeight) {
      top = Math.max(10, rect.top - menuHeight - 4);
    }

    let left = rect.right - menuWidth;
    if (left < 10) left = 10;

    setMenuPos({ top, left });
    setIsMenuOpen(true);
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    if (window.innerWidth < 768) {
      setIsMobileSheetOpen(true);
      return;
    }

    const menuHeight = 220;
    const menuWidth = 195;

    let top = e.clientY + 4;
    if (top + menuHeight > window.innerHeight) {
      top = Math.max(10, e.clientY - menuHeight - 4);
    }

    let left = e.clientX;
    if (left + menuWidth > window.innerWidth) {
      left = window.innerWidth - menuWidth - 10;
    }

    setMenuPos({ top, left });
    setIsMenuOpen(true);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    setIsMobileSheetOpen(false);
    if (confirm(`Delete chat with "${title}"? All messages will be permanently deleted.`)) {
      deleteChat(conversation.id);
    }
  };

  const handleToggleArchive = (e) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    setIsMobileSheetOpen(false);
    archiveChat(conversation.id, !isArchived);
  };

  const handleToggleMute = (e) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    setIsMobileSheetOpen(false);
    muteChat(conversation.id, !isMuted);
  };

  const handleTogglePin = (e) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    setIsMobileSheetOpen(false);
    pinChat(conversation.id, !isPinned);
  };

  const handleToggleUnread = (e) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    setIsMobileSheetOpen(false);
    markChatUnread(conversation.id);
  };

  return (
    <>
      <div
        onContextMenu={handleContextMenu}
        className={`w-full group/item relative ${
          isSelected
            ? 'bg-[#3390ec] dark:bg-[#2b5278] text-white'
            : 'hover:bg-zinc-100 dark:hover:bg-[#202b36] bg-white dark:bg-[#17212b] text-zinc-800 dark:text-zinc-200'
        }`}
      >
        <button
          type="button"
          onClick={() => selectConversation(conversation)}
          className="w-full px-3.5 py-3 flex items-center gap-3.5 text-left transition-colors relative"
        >
          {/* Telegram Avatar */}
          <div className="flex-shrink-0">
            {isGroup ? (
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
                isSelected
                  ? 'bg-white/20 text-white'
                  : 'bg-gradient-to-tr from-[#3390ec] to-[#5288c1] text-white shadow-xs'
              }`}>
                <Users className="w-6 h-6" />
              </div>
            ) : (
              <Avatar
                src={avatarSrc}
                name={title}
                size="lg"
                showStatus={true}
                isOnline={isOnline}
              />
            )}
          </div>

          {/* Info Container */}
          <div className="flex-1 min-w-0 pr-7">
            <div className="flex items-center justify-between mb-0.5">
              <div className="flex items-center gap-1.5 min-w-0">
                <h3 className={`text-sm font-semibold truncate ${isSelected ? 'text-white' : 'text-zinc-900 dark:text-white'}`}>
                  {title}
                </h3>
                {isPinned && (
                  <Pin className="w-3.5 h-3.5 rotate-45 flex-shrink-0 text-[#3390ec] dark:text-[#5288c1]" />
                )}
                {isMuted && (
                  <VolumeX className="w-3.5 h-3.5 flex-shrink-0 text-zinc-400" />
                )}
              </div>

              <span
                className={`text-[11px] whitespace-nowrap ml-2 ${
                  isSelected
                    ? 'text-white/80'
                    : unreadCount > 0
                    ? 'text-[#3390ec] dark:text-[#5288c1] font-bold'
                    : 'text-zinc-400 dark:text-zinc-500'
                }`}
              >
                {timeStr}
              </span>
            </div>

            <div className={`flex items-center justify-between text-xs ${isSelected ? 'text-white/90' : 'text-zinc-500 dark:text-zinc-400'}`}>
              <div className="truncate pr-2">{renderLastMessage()}</div>

              {/* Telegram Pill Badge */}
              {unreadCount > 0 && (
                <span className={`flex-shrink-0 min-w-5 h-5 px-1.5 rounded-full text-[11px] font-bold flex items-center justify-center ${
                  isSelected
                    ? 'bg-white text-[#3390ec]'
                    : 'bg-[#3390ec] dark:bg-[#5288c1] text-white'
                }`}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </div>
          </div>
        </button>

        {/* Quick Action Three-Dots Trigger Button */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 z-10">
          <button
            type="button"
            onClick={handleOpenMenu}
            className={`p-1.5 rounded-full transition ${
              isSelected
                ? 'text-white hover:bg-white/20'
                : 'text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-[#242f3d]'
            } ${isMenuOpen || isMobileSheetOpen ? 'opacity-100' : 'opacity-0 group-hover/item:opacity-100 md:group-hover/item:opacity-100'}`}
            title="Chat Options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Desktop Viewport-Fixed Popover (Never clipped by overflow-y-auto) */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-50 pointer-events-auto"
          onClick={(e) => {
            e.stopPropagation();
            setIsMenuOpen(false);
          }}
        >
          <div
            ref={menuRef}
            style={{
              top: `${menuPos.top}px`,
              left: `${menuPos.left}px`,
              position: 'fixed'
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-48 bg-white dark:bg-[#17212b] border border-zinc-200 dark:border-[#242f3d] rounded-2xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 text-xs font-medium"
          >
            {/* Pin / Unpin */}
            <button
              type="button"
              onClick={handleTogglePin}
              className="w-full px-3.5 py-2 flex items-center gap-2.5 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-[#242f3d] transition text-left"
            >
              {isPinned ? (
                <>
                  <PinOff className="w-4 h-4 text-zinc-400" />
                  <span>Unpin from Top</span>
                </>
              ) : (
                <>
                  <Pin className="w-4 h-4 text-[#3390ec]" />
                  <span>Pin to Top</span>
                </>
              )}
            </button>

            {/* Archive / Unarchive */}
            <button
              type="button"
              onClick={handleToggleArchive}
              className="w-full px-3.5 py-2 flex items-center gap-2.5 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-[#242f3d] transition text-left"
            >
              {isArchived ? (
                <>
                  <ArchiveRestore className="w-4 h-4 text-emerald-500" />
                  <span>Unarchive Chat</span>
                </>
              ) : (
                <>
                  <Archive className="w-4 h-4 text-zinc-400" />
                  <span>Archive Chat</span>
                </>
              )}
            </button>

            {/* Mute / Unmute */}
            <button
              type="button"
              onClick={handleToggleMute}
              className="w-full px-3.5 py-2 flex items-center gap-2.5 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-[#242f3d] transition text-left"
            >
              {isMuted ? (
                <>
                  <Volume2 className="w-4 h-4 text-emerald-500" />
                  <span>Unmute Notifications</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 text-zinc-400" />
                  <span>Mute Notifications</span>
                </>
              )}
            </button>

            {/* Mark as Unread */}
            <button
              type="button"
              onClick={handleToggleUnread}
              className="w-full px-3.5 py-2 flex items-center gap-2.5 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-[#242f3d] transition text-left"
            >
              <Mail className="w-4 h-4 text-zinc-400" />
              <span>Mark as Unread</span>
            </button>

            <div className="my-1 border-t border-zinc-200 dark:border-[#242f3d]" />

            {/* Delete Chat */}
            <button
              type="button"
              onClick={handleDelete}
              className="w-full px-3.5 py-2 flex items-center gap-2.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition text-left"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Chat</span>
            </button>
          </div>
        </div>
      )}

      {/* Mobile Native Bottom Action Sheet (100% Responsive, Never Cut Off) */}
      {isMobileSheetOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center animate-in fade-in duration-150">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={(e) => {
              e.stopPropagation();
              setIsMobileSheetOpen(false);
            }}
          />

          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg bg-white dark:bg-[#17212b] rounded-t-3xl shadow-2xl border-t border-zinc-200 dark:border-[#242f3d] p-4 pb-6 z-50 animate-in slide-in-from-bottom duration-200"
          >
            {/* Handle Drag Bar */}
            <div className="w-10 h-1 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mb-3" />

            {/* Header info */}
            <div className="flex items-center gap-3 px-1 pb-3 mb-2 border-b border-zinc-100 dark:border-[#242f3d]">
              <Avatar src={avatarSrc} name={title} size="md" />
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-sm text-zinc-900 dark:text-white truncate">{title}</h4>
                <p className="text-xs text-zinc-400 truncate">{timeStr}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileSheetOpen(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Actions list */}
            <div className="space-y-1 text-sm font-medium">
              <button
                type="button"
                onClick={handleTogglePin}
                className="w-full px-3 py-3 rounded-xl flex items-center gap-3 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-[#242f3d] transition text-left"
              >
                {isPinned ? <PinOff className="w-5 h-5 text-zinc-400" /> : <Pin className="w-5 h-5 text-[#3390ec]" />}
                <span>{isPinned ? 'Unpin from Top' : 'Pin to Top'}</span>
              </button>

              <button
                type="button"
                onClick={handleToggleArchive}
                className="w-full px-3 py-3 rounded-xl flex items-center gap-3 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-[#242f3d] transition text-left"
              >
                {isArchived ? <ArchiveRestore className="w-5 h-5 text-emerald-500" /> : <Archive className="w-5 h-5 text-zinc-400" />}
                <span>{isArchived ? 'Unarchive Chat' : 'Archive Chat'}</span>
              </button>

              <button
                type="button"
                onClick={handleToggleMute}
                className="w-full px-3 py-3 rounded-xl flex items-center gap-3 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-[#242f3d] transition text-left"
              >
                {isMuted ? <Volume2 className="w-5 h-5 text-emerald-500" /> : <VolumeX className="w-5 h-5 text-zinc-400" />}
                <span>{isMuted ? 'Unmute Notifications' : 'Mute Notifications'}</span>
              </button>

              <button
                type="button"
                onClick={handleToggleUnread}
                className="w-full px-3 py-3 rounded-xl flex items-center gap-3 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-[#242f3d] transition text-left"
              >
                <Mail className="w-5 h-5 text-zinc-400" />
                <span>Mark as Unread</span>
              </button>

              <div className="my-1 border-t border-zinc-200 dark:border-[#242f3d]" />

              <button
                type="button"
                onClick={handleDelete}
                className="w-full px-3 py-3 rounded-xl flex items-center gap-3 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition text-left"
              >
                <Trash2 className="w-5 h-5" />
                <span>Delete Chat</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsMobileSheetOpen(false)}
              className="w-full mt-3 py-3 rounded-2xl bg-zinc-100 dark:bg-[#242f3d] text-zinc-700 dark:text-zinc-200 font-semibold text-xs transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
