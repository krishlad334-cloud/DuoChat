import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';
import GroupInfoModal from './GroupInfoModal';
import { formatLastSeen } from '../../utils/dateUtils';
import { ArrowLeft, Users, Info, Phone, Search } from 'lucide-react';

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
      <div className="h-16 px-4 bg-[#f0f2f5] dark:bg-[#202c33] border-b border-[#e9edef] dark:border-[#222d34] flex items-center justify-between z-20">
        <div className="flex items-center gap-3 min-w-0">
          {/* Mobile Back Button */}
          <button
            onClick={closeMobileChat}
            className="md:hidden p-1.5 -ml-1 text-[#54656f] dark:text-[#aebac1] hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition"
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
              <div className="w-10 h-10 rounded-full bg-[#dfe5e7] dark:bg-[#111b21] text-[#54656f] dark:text-[#aebac1] flex items-center justify-center font-bold">
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
              <h2 className="text-sm font-semibold text-[#111b21] dark:text-[#e9edef] truncate">
                {title}
              </h2>
              {!isGroup && otherUser?.phone && (
                <span className="text-[11px] text-[#00a884] dark:text-[#25d366] font-medium hidden sm:inline">
                  • {otherUser.phone}
                </span>
              )}
            </div>

            <p
              className={`text-xs truncate transition-colors ${
                typingList.length > 0
                  ? 'text-[#00a884] dark:text-[#25d366] font-medium'
                  : isOnline
                  ? 'text-[#00a884] dark:text-[#25d366] font-medium'
                  : 'text-[#667781] dark:text-[#8696a0]'
              }`}
            >
              {statusText}
            </p>
          </div>
        </div>

        {/* Header Right Action Icons */}
        <div className="flex items-center gap-1 text-[#54656f] dark:text-[#aebac1]">
          {isGroup && (
            <button
              onClick={() => setIsGroupInfoOpen(true)}
              className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition"
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
