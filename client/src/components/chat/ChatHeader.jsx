import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';
import GroupInfoModal from './GroupInfoModal';
import { formatLastSeen } from '../../utils/dateUtils';
import { ArrowLeft, Users, Info, MoreVertical } from 'lucide-react';

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
    const names = typingList.map(u => u.name || u.username).join(', ');
    statusText = `${names} ${typingList.length === 1 ? 'is' : 'are'} typing...`;
  }

  const title = isGroup ? activeConversation.title : (otherUser?.name || 'User');
  const avatarSrc = isGroup ? null : otherUser?.avatar;

  return (
    <>
      <div className="h-16 px-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between z-20 shadow-xs">
        <div className="flex items-center gap-3 min-w-0">
          {/* Mobile Back Button */}
          <button
            onClick={closeMobileChat}
            className="md:hidden p-1.5 -ml-1 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
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
              <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
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

          {/* Title & Subtitle */}
          <div
            onClick={() => isGroup && setIsGroupInfoOpen(true)}
            className={`min-w-0 ${isGroup ? 'cursor-pointer' : ''}`}
          >
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
              {title}
            </h2>
            <p
              className={`text-xs truncate transition-colors ${
                typingList.length > 0
                  ? 'text-indigo-600 dark:text-indigo-400 font-medium'
                  : isOnline
                  ? 'text-emerald-500 font-medium'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {statusText}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {isGroup && (
            <button
              onClick={() => setIsGroupInfoOpen(true)}
              className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
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
