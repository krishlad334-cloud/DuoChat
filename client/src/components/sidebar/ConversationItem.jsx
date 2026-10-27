import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import Avatar from '../common/Avatar';
import { formatConversationTime } from '../../utils/dateUtils';
import { Check, CheckCheck, Users, Image as ImageIcon, FileText, Ban } from 'lucide-react';

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
  const title = isGroup ? conversation.title : (otherUser?.name || 'User');
  const avatarSrc = isGroup ? null : otherUser?.avatar;

  // Typing state for this conversation
  const activeTyping = typingUsers[conversation.id] || {};
  const typingNames = Object.values(activeTyping).map(u => u.name || u.username);
  const isTyping = typingNames.length > 0;

  // Last message snippet
  const lastMsg = conversation.last_message;
  const isLastMsgOwn = lastMsg && lastMsg.sender_id === user?.id;

  const renderLastMessage = () => {
    if (isTyping) {
      return (
        <span className="text-indigo-600 dark:text-indigo-400 font-medium animate-pulse">
          {typingNames.join(', ')} typing...
        </span>
      );
    }

    if (!lastMsg) {
      return <span className="italic text-slate-400">No messages yet</span>;
    }

    if (lastMsg.is_deleted) {
      return (
        <span className="italic text-slate-400 flex items-center gap-1">
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
              <CheckCheck className="w-3.5 h-3.5 text-cyan-500 stroke-[2.5]" />
            ) : lastMsg.status === 'delivered' ? (
              <CheckCheck className="w-3.5 h-3.5 text-slate-400 stroke-[2]" />
            ) : (
              <Check className="w-3.5 h-3.5 text-slate-400 stroke-[2]" />
            )}
          </span>
        )}

        {isGroup && !isLastMsgOwn && (
          <span className="font-medium text-slate-700 dark:text-slate-300">
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
            <span>{lastMsg.file_name || 'File'}</span>
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
      className={`w-full p-3 flex items-center gap-3 text-left transition-colors relative border-b border-slate-100 dark:border-slate-800/50 ${
        isSelected
          ? 'bg-indigo-50/80 dark:bg-indigo-950/40 text-slate-900 dark:text-white'
          : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-800 dark:text-slate-200'
      }`}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        {isGroup ? (
          <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
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
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-semibold truncate text-slate-900 dark:text-white">
            {title}
          </h3>
          <span
            className={`text-[11px] whitespace-nowrap ml-2 ${
              unreadCount > 0
                ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'text-slate-400 dark:text-slate-500'
            }`}
          >
            {timeStr}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="truncate pr-2">{renderLastMessage()}</div>

          {/* Unread badge */}
          {unreadCount > 0 && (
            <span className="flex-shrink-0 px-2 py-0.5 bg-indigo-600 text-white rounded-full text-[10px] font-bold shadow-sm">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
