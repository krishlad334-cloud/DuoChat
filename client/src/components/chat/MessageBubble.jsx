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

  // Status tick renderer
  const renderStatus = () => {
    if (!isOwn) return null;

    if (message.status === 'read') {
      return (
        <span title="Read" className="text-cyan-300 dark:text-cyan-400">
          <CheckCheck className="w-3.5 h-3.5 stroke-[2.5]" />
        </span>
      );
    }
    if (message.status === 'delivered') {
      return (
        <span title="Delivered" className="text-slate-300 dark:text-slate-400">
          <CheckCheck className="w-3.5 h-3.5 stroke-[2]" />
        </span>
      );
    }
    // Sent / Pending
    return (
      <span title="Sent" className="text-slate-300 dark:text-slate-400">
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
        className={`relative max-w-[85%] sm:max-w-[70%] rounded-2xl px-3.5 py-2.5 shadow-sm transition-all ${
          isOwn
            ? 'bg-indigo-600 text-white rounded-tr-xs'
            : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/60 rounded-tl-xs'
        }`}
      >
        {/* Sender name for group chat */}
        {isGroup && !isOwn && (
          <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
            {message.sender_name}
          </div>
        )}

        {/* Deleted Message */}
        {isDeleted ? (
          <div className="flex items-center gap-1.5 text-xs italic opacity-75 py-1">
            <Ban className="w-3.5 h-3.5" />
            <span>This message was deleted</span>
          </div>
        ) : (
          <>
            {/* Image attachment */}
            {message.type === 'image' && message.file_url && (
              <div className="mb-2 overflow-hidden rounded-xl bg-black/5 dark:bg-white/5">
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
                className={`flex items-center gap-3 p-2.5 mb-2 rounded-xl border ${
                  isOwn
                    ? 'bg-white/10 border-white/20 text-white'
                    : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700'
                }`}
              >
                <div
                  className={`p-2 rounded-lg ${
                    isOwn
                      ? 'bg-white/20 text-white'
                      : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                  }`}
                >
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0 pr-2">
                  <div className="text-xs font-semibold truncate">
                    {message.file_name || 'Document'}
                  </div>
                  <div
                    className={`text-[10px] ${
                      isOwn ? 'text-indigo-200' : 'text-slate-400'
                    }`}
                  >
                    {formatFileSize(message.file_size)}
                  </div>
                </div>
                <a
                  href={message.file_url}
                  download={message.file_name || 'download'}
                  target="_blank"
                  rel="noreferrer"
                  className={`p-1.5 rounded-lg transition ${
                    isOwn
                      ? 'hover:bg-white/20 text-white'
                      : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500'
                  }`}
                  title="Download file"
                >
                  <Download className="w-4 h-4" />
                </a>
              </div>
            )}

            {/* Text content with line-breaks */}
            {message.content && (
              <p className="text-sm whitespace-pre-wrap break-words leading-relaxed select-text">
                {message.content}
              </p>
            )}
          </>
        )}

        {/* Footer info: Timestamp + Ticks */}
        <div
          className={`flex items-center justify-end gap-1 mt-1 text-[10px] select-none ${
            isOwn ? 'text-indigo-100/80' : 'text-slate-400 dark:text-slate-500'
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
          className="absolute -top-2 right-1 p-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-500 rounded-full shadow-md transition"
          title="Delete message"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
