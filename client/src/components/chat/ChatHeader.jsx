import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';
import GroupInfoModal from './GroupInfoModal';
import { formatLastSeen } from '../../utils/dateUtils';
import {
  ArrowLeft,
  Users,
  Info,
  Phone,
  MoreVertical,
  Volume2,
  VolumeX,
  Archive,
  ArchiveRestore,
  Trash2,
  Eraser
} from 'lucide-react';

export default function ChatHeader() {
  const { user } = useAuth();
  const {
    activeConversation,
    closeMobileChat,
    onlinePresence,
    typingUsers,
    deleteChat,
    clearChat,
    archiveChat,
    muteChat
  } = useChat();

  const [isGroupInfoOpen, setIsGroupInfoOpen] = useState(false);
  const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);
  const headerMenuRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (headerMenuRef.current && !headerMenuRef.current.contains(e.target)) {
        setIsHeaderMenuOpen(false);
      }
    }
    if (isHeaderMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isHeaderMenuOpen]);

  if (!activeConversation) return null;

  const isGroup = Boolean(activeConversation.is_group);
  const otherUser = activeConversation.other_user;
  const isMuted = Boolean(activeConversation.is_muted);
  const isArchived = Boolean(activeConversation.is_archived);

  // Online status calculation
  let isOnline = false;
  let statusText = '';

  if (isGroup) {
    const memberCount = activeConversation.members?.length || 0;
    statusText = `${memberCount} members`;
  } else if (otherUser) {
    const presence = onlinePresence[otherUser.id];
    isOnline = presence?.status === 'online' || otherUser.status === 'online';
    const lastSeen = presence?.lastSeen || otherUser.last_seen;
    statusText = isOnline ? 'online' : formatLastSeen('offline', lastSeen);
  }

  // Check if anyone is typing in this chat
  const typingList = Object.values(typingUsers[activeConversation.id] || {});
  if (typingList.length > 0) {
    const names = typingList.map(u => u.name || u.phone || u.username).join(', ');
    statusText = `${names} is typing...`;
  }

  const title = isGroup ? activeConversation.title : (otherUser?.name || otherUser?.phone || 'Contact');
  const avatarSrc = isGroup ? null : otherUser?.avatar;

  const handleDelete = () => {
    setIsHeaderMenuOpen(false);
    if (confirm(`Delete chat with "${title}"? All messages will be permanently deleted.`)) {
      deleteChat(activeConversation.id);
    }
  };

  const handleClearHistory = () => {
    setIsHeaderMenuOpen(false);
    if (confirm('Clear all messages in this chat?')) {
      clearChat(activeConversation.id);
    }
  };

  return (
    <>
      <div className="h-14 px-4 bg-white dark:bg-[#17212b] border-b border-[#e4e7ea] dark:border-[#242f3d] flex items-center justify-between z-20">
        <div className="flex items-center gap-3 min-w-0">
          {/* Mobile Back Arrow (Telegram Signature) */}
          <button
            type="button"
            onClick={closeMobileChat}
            className="md:hidden p-1.5 -ml-1 text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white rounded-full hover:bg-zinc-100 dark:hover:bg-[#242f3d] transition"
            title="Back to chats"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Avatar (Click opens group info / contact details) */}
          <div
            onClick={() => isGroup && setIsGroupInfoOpen(true)}
            className={`flex-shrink-0 ${isGroup ? 'cursor-pointer' : ''}`}
          >
            {isGroup ? (
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#3390ec] to-[#5288c1] text-white flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
            ) : (
              <Avatar
                src={avatarSrc}
                name={title}
                size="md"
                showStatus={true}
                isOnline={isOnline}
              />
            )}
          </div>

          {/* Title & Status */}
          <div
            onClick={() => isGroup && setIsGroupInfoOpen(true)}
            className={`min-w-0 ${isGroup ? 'cursor-pointer' : ''}`}
          >
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white truncate">
              {title}
            </h2>
            <p className={`text-xs truncate font-medium ${
              typingList.length > 0
                ? 'text-[#3390ec] dark:text-[#4faeef] animate-pulse'
                : isOnline
                ? 'text-[#3390ec] dark:text-[#4faeef]'
                : 'text-zinc-400 dark:text-zinc-500'
            }`}>
              {statusText}
            </p>
          </div>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400 relative">
          {!isGroup && otherUser?.phone && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-zinc-100 dark:bg-[#242f3d]/60 rounded-full text-xs font-mono text-[#3390ec] dark:text-[#5288c1]">
              <Phone className="w-3 h-3" />
              <span>{otherUser.phone}</span>
            </div>
          )}

          {isGroup && (
            <button
              type="button"
              onClick={() => setIsGroupInfoOpen(true)}
              className="p-2 hover:bg-zinc-100 dark:hover:bg-[#242f3d] hover:text-zinc-900 dark:hover:text-white rounded-full transition"
              title="Group Info"
            >
              <Info className="w-4 h-4" />
            </button>
          )}

          {/* Three Dots Menu Button */}
          <div ref={headerMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setIsHeaderMenuOpen(!isHeaderMenuOpen)}
              className="p-2 hover:bg-zinc-100 dark:hover:bg-[#242f3d] hover:text-zinc-900 dark:hover:text-white rounded-full transition"
              title="More Options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {/* Header Dropdown Menu */}
            {isHeaderMenuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-48 bg-white dark:bg-[#17212b] border border-zinc-200 dark:border-[#242f3d] rounded-2xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => {
                    setIsHeaderMenuOpen(false);
                    muteChat(activeConversation.id, !isMuted);
                  }}
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

                <button
                  type="button"
                  onClick={() => {
                    setIsHeaderMenuOpen(false);
                    archiveChat(activeConversation.id, !isArchived);
                  }}
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

                <button
                  type="button"
                  onClick={handleClearHistory}
                  className="w-full px-3.5 py-2 flex items-center gap-2.5 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition text-left"
                >
                  <Eraser className="w-4 h-4" />
                  <span>Clear History</span>
                </button>

                <div className="my-1 border-t border-zinc-200 dark:border-[#242f3d]" />

                <button
                  type="button"
                  onClick={handleDelete}
                  className="w-full px-3.5 py-2 flex items-center gap-2.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition text-left"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Chat</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {isGroup && (
        <GroupInfoModal
          isOpen={isGroupInfoOpen}
          onClose={() => setIsGroupInfoOpen(false)}
          conversation={activeConversation}
        />
      )}
    </>
  );
}
