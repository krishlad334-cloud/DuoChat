import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import Avatar from '../common/Avatar';
import { formatConversationTime } from '../../utils/dateUtils';
import { Check, CheckCheck, Users, Image as ImageIcon, FileText, Ban, Phone } from 'lucide-react';

export default function ConversationItem({ conversation }) {
  const { user } = useAuth();
  const { activeConversation, selectConversation, onlinePresence, typingUsers } = useChat();

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
        <span className="text-[#00a884] dark:text-[#25d366] font-medium animate-pulse">
          typing...
        </span>
      );
    }

    if (!lastMsg) {
      if (!isGroup && otherUser?.phone) {
        return (
          <span className="text-xs text-[#00a884] dark:text-[#25d366] flex items-center gap-1 font-medium">
            <Phone className="w-3 h-3" />
            <span>{otherUser.phone}</span>
          </span>
        );
      }
      return <span className="italic text-[#8696a0]">No messages yet</span>;
    }

    if (lastMsg.is_deleted) {
      return (
        <span className="italic text-[#8696a0] flex items-center gap-1">
          <Ban className="w-3 h-3" />
          <span>This message was deleted</span>
        </span>
      );
    }

    return (
      <span className="flex items-center gap-1">
        {isLastMsgOwn && (
          <span className="flex-shrink-0">
            {lastMsg.status === 'read' ? (
              <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb] stroke-[2.5]" />
            ) : lastMsg.status === 'delivered' ? (
              <CheckCheck className="w-3.5 h-3.5 text-[#8696a0] stroke-[2]" />
            ) : (
              <Check className="w-3.5 h-3.5 text-[#8696a0] stroke-[2]" />
            )}
          </span>
        )}

        {isGroup && !isLastMsgOwn && (
          <span className="font-medium text-[#111b21] dark:text-[#e9edef]">
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

  return (
    <button
      type="button"
      onClick={() => selectConversation(conversation)}
      className={`w-full px-3.5 py-3 flex items-center gap-3.5 text-left transition-colors relative border-b border-[#e9edef]/80 dark:border-[#222d34]/80 ${
        isSelected
          ? 'bg-[#f0f2f5] dark:bg-[#2a3942]'
          : 'hover:bg-[#f5f6f6] dark:hover:bg-[#202c33]/70 bg-white dark:bg-[#111b21]'
      }`}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        {isGroup ? (
          <div className="w-12 h-12 rounded-full bg-[#dfe5e7] dark:bg-[#202c33] text-[#54656f] dark:text-[#aebac1] flex items-center justify-center font-bold">
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

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <h3 className="text-sm font-semibold truncate text-[#111b21] dark:text-[#e9edef]">
            {title}
          </h3>
          <span
            className={`text-[11px] whitespace-nowrap ml-2 ${
              unreadCount > 0
                ? 'text-[#25d366] font-semibold'
                : 'text-[#667781] dark:text-[#8696a0]'
            }`}
          >
            {timeStr}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-[#667781] dark:text-[#8696a0]">
          <div className="truncate pr-2">{renderLastMessage()}</div>

          {/* WhatsApp Vibrant Green Unread Badge */}
          {unreadCount > 0 && (
            <span className="flex-shrink-0 min-w-5 h-5 px-1.5 bg-[#25d366] text-white rounded-full text-[11px] font-bold flex items-center justify-center shadow-xs">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
