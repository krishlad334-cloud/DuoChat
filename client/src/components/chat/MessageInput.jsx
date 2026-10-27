import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../context/ChatContext';
import EmojiPickerPopover from './EmojiPickerPopover';
import { Paperclip, Smile, Send, X, FileText, Loader2 } from 'lucide-react';
import { formatFileSize } from '../../utils/formatters';

export default function MessageInput() {
  const { sendMessage, emitTypingStart, emitTypingStop } = useChat();

  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);
  const [sending, setSending] = useState(false);

  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [text]);

  const handleTextChange = (e) => {
    setText(e.target.value);
    emitTypingStart();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (selected.size > 15 * 1024 * 1024) {
      alert('File size exceeds the 15MB limit.');
      return;
    }

    setFile(selected);

    if (selected.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setFilePreview(ev.target.result);
      };
      reader.readAsDataURL(selected);
    } else {
      setFilePreview(null);
    }
  };

  const removeFile = () => {
    setFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSelectEmoji = (emoji) => {
    setText(prev => prev + emoji);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleSend = async () => {
    if ((!text.trim() && !file) || sending) return;

    try {
      setSending(true);
      emitTypingStop();

      const currentText = text;
      const currentFile = file;

      setText('');
      removeFile();
      setIsEmojiOpen(false);

      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }

      await sendMessage({
        content: currentText,
        file: currentFile,
      });
    } catch (err) {
      console.error('Failed to send message:', err);
      alert('Failed to send message: ' + (err.message || 'Unknown error'));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="relative px-4 py-3 bg-white dark:bg-[#17212b] border-t border-[#e4e7ea] dark:border-[#242f3d]">
      <div className="max-w-4xl mx-auto">
        {/* File preview pill before sending */}
        {file && (
          <div className="mb-2 p-2 bg-zinc-50 dark:bg-[#0e1621] rounded-xl border border-zinc-200 dark:border-[#242f3d] flex items-center justify-between max-w-sm animate-in fade-in duration-150">
            <div className="flex items-center gap-2.5 min-w-0">
              {filePreview ? (
                <img
                  src={filePreview}
                  alt="Preview"
                  className="w-10 h-10 object-cover rounded-lg"
                />
              ) : (
                <div className="p-2 bg-[#3390ec]/20 text-[#3390ec] dark:text-[#5288c1] rounded-lg">
                  <FileText className="w-5 h-5" />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                  {file.name}
                </p>
                <p className="text-[10px] text-zinc-400">
                  {formatFileSize(file.size)}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={removeFile}
              className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Emoji Picker Popover */}
        <EmojiPickerPopover
          isOpen={isEmojiOpen}
          onClose={() => setIsEmojiOpen(false)}
          onSelectEmoji={handleSelectEmoji}
        />

        <div className="flex items-end gap-2 text-zinc-400">
          {/* Emoji button (Telegram Style) */}
          <button
            type="button"
            onClick={() => setIsEmojiOpen(!isEmojiOpen)}
            className={`p-2.5 rounded-full transition ${
              isEmojiOpen
                ? 'text-[#3390ec] dark:text-[#5288c1] bg-[#3390ec]/10'
                : 'hover:bg-zinc-100 dark:hover:bg-[#242f3d] hover:text-[#3390ec] dark:hover:text-[#5288c1]'
            }`}
            title="Emojis"
          >
            <Smile className="w-5 h-5" />
          </button>

          {/* Text Input */}
          <div className="flex-1 min-w-0">
            <textarea
              ref={textareaRef}
              rows={1}
              value={text}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              placeholder="Write a message..."
              className="w-full max-h-32 px-4 py-2.5 bg-zinc-100 dark:bg-[#0e1621] border border-transparent focus:border-[#3390ec]/40 dark:focus:border-[#5288c1]/40 rounded-2xl text-sm focus:outline-none text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 resize-none leading-relaxed transition"
            />
          </div>

          {/* Attachment button */}
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.txt,.zip"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 hover:bg-zinc-100 dark:hover:bg-[#242f3d] hover:text-[#3390ec] dark:hover:text-[#5288c1] rounded-full transition"
            title="Attach Media or File"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          {/* Telegram Circular Send Button */}
          <button
            type="button"
            disabled={(!text.trim() && !file) || sending}
            onClick={handleSend}
            className="w-10 h-10 bg-[#3390ec] dark:bg-[#5288c1] hover:bg-[#2b7dce] dark:hover:bg-[#4677aa] active:scale-95 disabled:opacity-40 text-white rounded-full shadow-md flex items-center justify-center transition flex-shrink-0"
            title="Send"
          >
            {sending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-4.5 h-4.5 -translate-x-0.5 translate-y-0.5 fill-white" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
