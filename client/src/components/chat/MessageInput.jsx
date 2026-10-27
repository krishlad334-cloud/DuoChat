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
    <div className="relative px-4 py-3 bg-white dark:bg-[#121215] border-t border-zinc-200/80 dark:border-zinc-800">
      {/* File preview pill before sending */}
      {file && (
        <div className="mb-2 p-2 bg-zinc-50 dark:bg-[#18181b] rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between max-w-sm animate-in fade-in duration-150">
          <div className="flex items-center gap-2.5 min-w-0">
            {filePreview ? (
              <img
                src={filePreview}
                alt="Preview"
                className="w-10 h-10 object-cover rounded-lg"
              />
            ) : (
              <div className="p-2 bg-violet-100 dark:bg-violet-950/70 text-violet-600 dark:text-violet-400 rounded-lg">
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
          className="p-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-violet-600 dark:hover:text-violet-400 rounded-xl transition"
          title="Attach file or photo"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        {/* Emoji toggle button */}
        <button
          type="button"
          onClick={() => setIsEmojiOpen(!isEmojiOpen)}
          className={`p-2.5 rounded-xl transition ${
            isEmojiOpen
              ? 'text-violet-600 bg-violet-50 dark:bg-violet-950/50'
              : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-violet-600 dark:hover:text-violet-400'
          }`}
          title="Insert emoji"
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
            placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
            className="w-full max-h-32 px-4 py-2.5 bg-zinc-100 dark:bg-[#18181b] border-0 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 resize-none leading-relaxed transition"
          />
        </div>

        {/* Send Button */}
        <button
          type="button"
          disabled={(!text.trim() && !file) || sending}
          onClick={handleSend}
          className="p-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 active:scale-95 disabled:opacity-40 text-white rounded-xl shadow-md shadow-violet-500/25 flex items-center justify-center transition flex-shrink-0"
          title="Send message"
        >
          {sending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
}
