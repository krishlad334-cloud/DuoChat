import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';
import GroupInfoModal from './GroupInfoModal';
import { formatLastSeen } from '../../utils/dateUtils';
import { ArrowLeft, Users, Info, Phone, MoreVertical, Search } from 'lucide-react';

export default function ChatHeader() {
  const { user } = useAuth();
  const {
    activeConversation,
    closeMobileChat,
    onlinePresence,
    typingUsers
  } = useChat();

  const [isGroupInfoOpen, setIsGroupInfoOpen] = useState(false);

  if (!activeConversation) return null;

  const isGroup = Boolean(activeConversation.is_group);
  const otherUser = activeConversation.other_user;

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
        <div className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400">
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
