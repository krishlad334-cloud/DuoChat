import React, { useState } from 'react';
import { formatMessageTime } from '../../utils/dateUtils';
import { formatFileSize } from '../../utils/formatters';
import { Check, CheckCheck, FileText, Download, Trash2, Ban } from 'lucide-react';

export default function MessageBubble({
  message,
  isOwn,
  isGroup,
  onDelete,
  onImageClick
}) {
  const [showActions, setShowActions] = useState(false);

  // Status tick renderer (Telegram Web style)
  const renderStatus = () => {
    if (!isOwn) return null;

    if (message.status === 'read') {
      return (
        <span title="Read" className="text-[#4faeef]">
          <CheckCheck className="w-3.5 h-3.5 stroke-[2.5]" />
        </span>
      );
    }
    if (message.status === 'delivered') {
      return (
        <span title="Delivered" className="text-white/60 dark:text-white/50">
          <CheckCheck className="w-3.5 h-3.5 stroke-[2]" />
        </span>
      );
    }
    // Sent / Pending
    return (
      <span title="Sent" className="text-white/60 dark:text-white/50">
        <Check className="w-3.5 h-3.5 stroke-[2]" />
      </span>
    );
  };

  const isDeleted = Boolean(message.is_deleted);
  const timeStr = formatMessageTime(message.created_at);

  return (
    <div
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      className={`relative group flex flex-col my-1 max-w-full ${
        isOwn ? 'items-end' : 'items-start'
      }`}
    >
      <div
        className={`relative max-w-[85%] sm:max-w-[70%] px-3.5 py-2 shadow-xs transition-all ${
          isOwn
            ? 'bg-[#effdde] dark:bg-[#2b5278] text-zinc-900 dark:text-white rounded-2xl rounded-br-xs shadow-xs'
            : 'bg-white dark:bg-[#182533] text-zinc-900 dark:text-white border border-[#e4e7ea]/60 dark:border-[#242f3d]/60 rounded-2xl rounded-bl-xs shadow-xs'
        }`}
      >
        {/* Sender name for group chat (Telegram style) */}
        {isGroup && !isOwn && (
          <div className="text-xs font-bold text-[#3390ec] dark:text-[#4faeef] mb-1">
            {message.sender_name}
          </div>
        )}

        {/* Deleted Message */}
        {isDeleted ? (
          <div className="flex items-center gap-1.5 text-xs italic opacity-70 py-0.5">
            <Ban className="w-3.5 h-3.5" />
            <span>This message was deleted</span>
          </div>
        ) : (
          <>
            {/* Image attachment */}
            {message.type === 'image' && message.file_url && (
              <div className="mb-1.5 overflow-hidden rounded-xl bg-black/5 dark:bg-black/20">
                <img
                  src={message.file_url}
                  alt={message.file_name || 'Attachment'}
                  onClick={() => onImageClick && onImageClick(message.file_url)}
                  className="max-h-72 w-auto object-cover cursor-pointer hover:opacity-95 transition rounded-xl"
                  loading="lazy"
                />
              </div>
            )}

            {/* Document / generic file attachment */}
            {message.type === 'file' && message.file_url && (
              <div
                className={`flex items-center gap-3 p-2.5 mb-1.5 rounded-xl border ${
                  isOwn
                    ? 'bg-black/5 dark:bg-black/20 border-black/10 dark:border-white/10'
                    : 'bg-zinc-50 dark:bg-[#0e1621] border-zinc-200 dark:border-[#242f3d]'
                }`}
              >
                <div
                  className={`p-2.5 rounded-full ${
                    isOwn
                      ? 'bg-[#3390ec] text-white'
                      : 'bg-[#3390ec] text-white'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0 pr-2">
                  <div className="text-xs font-semibold truncate">
                    {message.file_name || 'Document'}
                  </div>
                  <div className="text-[10px] text-zinc-500 dark:text-zinc-400">
                    {formatFileSize(message.file_size)}
                  </div>
                </div>
                <a
                  href={message.file_url}
                  download={message.file_name || 'download'}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition"
                  title="Download file"
                >
                  <Download className="w-4 h-4" />
                </a>
              </div>
            )}

            {/* Text content with line-breaks */}
            {message.content && (
              <p className="text-sm whitespace-pre-wrap break-words leading-relaxed select-text pr-14 inline-block">
                {message.content}
              </p>
            )}
          </>
        )}

        {/* Telegram Integrated Timestamp & Read Checkmark */}
        <div
          className={`float-right flex items-center gap-1 text-[10px] select-none ml-2 mt-1 -mb-0.5 ${
            isOwn
              ? 'text-zinc-500 dark:text-white/60'
              : 'text-zinc-400 dark:text-zinc-400'
          }`}
        >
          <span>{timeStr}</span>
          {renderStatus()}
        </div>
      </div>

      {/* Delete button on hover for own message */}
      {isOwn && !isDeleted && showActions && (
        <button
          onClick={() => onDelete && onDelete(message.id)}
          className="absolute -top-2 right-1 p-1 bg-white dark:bg-[#17212b] border border-zinc-200 dark:border-[#242f3d] text-zinc-400 hover:text-rose-500 rounded-full shadow-md transition"
          title="Delete message"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
