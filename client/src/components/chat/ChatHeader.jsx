import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';
import GroupInfoModal from './GroupInfoModal';
import { formatLastSeen } from '../../utils/dateUtils';
import { ArrowLeft, Users, Info, Phone } from 'lucide-react';

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
    const names = (activeConversation.members || [])
      .map(m => (m.id === user?.id ? 'You' : m.name))
      .slice(0, 3)
      .join(', ');
    statusText = `${memberCount} members • ${names}${memberCount > 3 ? '...' : ''}`;
  } else if (otherUser) {
    const presence = onlinePresence[otherUser.id];
    isOnline = presence?.status === 'online' || otherUser.status === 'online';
    const lastSeen = presence?.lastSeen || otherUser.last_seen;
    statusText = isOnline ? 'Online' : formatLastSeen('offline', lastSeen);
  }

  // Check if anyone is typing in this chat
  const typingList = Object.values(typingUsers[activeConversation.id] || {});
  if (typingList.length > 0) {
    const names = typingList.map(u => u.name || u.phone || u.username).join(', ');
    statusText = `${names} ${typingList.length === 1 ? 'is' : 'are'} typing...`;
  }

  const title = isGroup ? activeConversation.title : (otherUser?.name || otherUser?.phone || 'Contact');
  const avatarSrc = isGroup ? null : otherUser?.avatar;

  return (
    <>
      <div className="h-16 px-4 bg-white dark:bg-[#121215] border-b border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between z-20">
        <div className="flex items-center gap-3 min-w-0">
          {/* Mobile Back Button */}
          <button
            onClick={closeMobileChat}
            className="md:hidden p-1.5 -ml-1 text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition"
            title="Back to chats"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Avatar */}
          <div
            onClick={() => isGroup && setIsGroupInfoOpen(true)}
            className={isGroup ? 'cursor-pointer' : ''}
          >
            {isGroup ? (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600/10 to-indigo-600/10 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold border border-violet-500/20">
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

          {/* Title & Contact Phone Number / Status */}
          <div
            onClick={() => isGroup && setIsGroupInfoOpen(true)}
            className={`min-w-0 ${isGroup ? 'cursor-pointer' : ''}`}
          >
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
                {title}
              </h2>
              {!isGroup && otherUser?.phone && (
                <span className="text-[11px] text-violet-600 dark:text-violet-400 font-medium hidden sm:inline">
                  • {otherUser.phone}
                </span>
              )}
            </div>

            <p
              className={`text-xs truncate transition-colors ${
                typingList.length > 0
                  ? 'text-violet-600 dark:text-violet-400 font-medium'
                  : isOnline
                  ? 'text-emerald-500 font-medium'
                  : 'text-zinc-500 dark:text-zinc-400'
              }`}
            >
              {statusText}
            </p>
          </div>
        </div>

        {/* Header Right Action Icons */}
        <div className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400">
          {isGroup && (
            <button
              onClick={() => setIsGroupInfoOpen(true)}
              className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition"
              title="Group info & members"
            >
              <Info className="w-5 h-5" />
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
