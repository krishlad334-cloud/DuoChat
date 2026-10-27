import React, { useState } from 'react';
import { formatMessageTime } from '../../utils/dateUtils';
import { formatFileSize, getRandomColor } from '../../utils/formatters';
import { Check, CheckCheck, FileText, Download, Trash2, Ban } from 'lucide-react';

export default function MessageBubble({
  message,
  isOwn,
  isGroup,
  onDelete,
  onImageClick
}) {
  const [showActions, setShowActions] = useState(false);

  // Status tick renderer in WhatsApp styling
  const renderStatus = () => {
    if (!isOwn) return null;

    if (message.status === 'read') {
      return (
        <span title="Read" className="text-[#53bdeb]">
          <CheckCheck className="w-3.5 h-3.5 stroke-[2.5]" />
        </span>
      );
    }
    if (message.status === 'delivered') {
      return (
        <span title="Delivered" className="text-[#8696a0]">
          <CheckCheck className="w-3.5 h-3.5 stroke-[2]" />
        </span>
      );
    }
    // Sent / Pending
    return (
      <span title="Sent" className="text-[#8696a0]">
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
      className={`relative group flex flex-col my-1 ${
        isOwn ? 'items-end' : 'items-start'
      }`}
    >
      <div
        className={`relative max-w-[85%] sm:max-w-[65%] rounded-lg px-3 py-1.5 shadow-[0_1px_0.5px_rgba(11,20,26,0.13)] transition-all ${
          isOwn
            ? 'bg-[#d9fdd3] dark:bg-[#005c4b] text-[#111b21] dark:text-[#e9edef] rounded-tr-none'
            : 'bg-white dark:bg-[#202c33] text-[#111b21] dark:text-[#e9edef] rounded-tl-none'
        }`}
      >
        {/* Sender name for group chat */}
        {isGroup && !isOwn && (
          <div className="text-xs font-semibold text-[#00a884] dark:text-[#25d366] mb-0.5">
            {message.sender_name}
          </div>
        )}

        {/* Deleted Message */}
        {isDeleted ? (
          <div className="flex items-center gap-1.5 text-xs italic text-[#8696a0] py-0.5">
            <Ban className="w-3.5 h-3.5" />
            <span>This message was deleted</span>
          </div>
        ) : (
          <>
            {/* Image attachment */}
            {message.type === 'image' && message.file_url && (
              <div className="mb-1.5 overflow-hidden rounded-lg bg-black/5 dark:bg-white/5">
                <img
                  src={message.file_url}
                  alt={message.file_name || 'Attachment'}
                  onClick={() => onImageClick && onImageClick(message.file_url)}
                  className="max-h-72 w-auto object-cover cursor-pointer hover:opacity-95 transition rounded-lg"
                  loading="lazy"
                />
              </div>
            )}

            {/* Document / generic file attachment */}
            {message.type === 'file' && message.file_url && (
              <div
                className={`flex items-center gap-3 p-2 mb-1.5 rounded-lg border ${
                  isOwn
                    ? 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10'
                    : 'bg-[#f0f2f5] dark:bg-[#111b21] border-[#e9edef] dark:border-[#222d34]'
                }`}
              >
                <div className="p-2 rounded-lg bg-[#00a884] text-white">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0 pr-2">
                  <div className="text-xs font-semibold truncate">
                    {message.file_name || 'Document'}
                  </div>
                  <div className="text-[10px] text-[#667781] dark:text-[#8696a0]">
                    {formatFileSize(message.file_size)}
                  </div>
                </div>
                <a
                  href={message.file_url}
                  download={message.file_name || 'download'}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 text-[#54656f] dark:text-[#aebac1] transition"
                  title="Download file"
                >
                  <Download className="w-4 h-4" />
                </a>
              </div>
            )}

            {/* Text content with line-breaks */}
            {message.content && (
              <p className="text-sm whitespace-pre-wrap break-words leading-relaxed select-text pr-14">
                {message.content}
              </p>
            )}
          </>
        )}

        {/* Footer info: Timestamp + WhatsApp Ticks in bottom-right */}
        <div className="absolute right-2 bottom-1 flex items-center gap-1 text-[10px] text-[#667781] dark:text-[#8696a0] select-none">
          <span>{timeStr}</span>
          {renderStatus()}
        </div>
      </div>

      {/* Delete button on hover for own message */}
      {isOwn && !isDeleted && showActions && (
        <button
          onClick={() => onDelete && onDelete(message.id)}
          className="absolute -top-2 right-1 p-1 bg-white dark:bg-[#202c33] border border-[#e9edef] dark:border-[#222d34] text-[#8696a0] hover:text-rose-500 rounded-full shadow-md transition"
          title="Delete message"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
