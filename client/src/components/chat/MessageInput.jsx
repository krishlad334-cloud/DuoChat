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
    <div className="relative px-4 py-3 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800">
      {/* File preview pill before sending */}
      {file && (
        <div className="mb-2 p-2 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between max-w-sm animate-in fade-in duration-150">
          <div className="flex items-center gap-2.5 min-w-0">
            {filePreview ? (
              <img
                src={filePreview}
                alt="Preview"
                className="w-10 h-10 object-cover rounded-lg"
              />
            ) : (
              <div className="p-2 bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 rounded-lg">
                <FileText className="w-5 h-5" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                {file.name}
              </p>
              <p className="text-[10px] text-slate-400">
                {formatFileSize(file.size)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={removeFile}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
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

      <div className="flex items-end gap-2 text-slate-500 dark:text-slate-400">
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
          className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl transition"
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
              ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50'
              : 'hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400'
          }`}
          title="Insert emoji"
        >
          <Smile className="w-5 h-5" />
        </button>

        {/* Modern Textarea */}
        <div className="flex-1 min-w-0">
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
            className="w-full max-h-32 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-0 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-slate-900 dark:text-slate-100 placeholder-slate-400 resize-none leading-relaxed transition"
          />
        </div>

        {/* Send Button */}
        <button
          type="button"
          disabled={(!text.trim() && !file) || sending}
          onClick={handleSend}
          className="p-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 disabled:opacity-40 text-white rounded-xl shadow-md shadow-indigo-500/25 flex items-center justify-center transition flex-shrink-0"
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
