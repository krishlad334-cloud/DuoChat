import React, { useState, useRef, useEffect } from 'react';
import { Smile, Search, X } from 'lucide-react';

const EMOJI_CATEGORIES = [
  {
    name: 'Smileys',
    icon: '😀',
    emojis: [
      '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
      '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
      '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
      '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
      '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬',
      '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗',
      '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯'
    ]
  },
  {
    name: 'Hands & Gestures',
    icon: '👋',
    emojis: [
      '👋', '🤚', '🖐', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞',
      '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍',
      '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝',
      '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦿', '🦵', '🦶', '👂'
    ]
  },
  {
    name: 'Hearts & Love',
    icon: '❤️',
    emojis: [
      '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
      '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️',
      '✝️', '☪️', '🕉', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐'
    ]
  },
  {
    name: 'Objects & Symbols',
    icon: '💡',
    emojis: [
      '💡', '🔥', '✨', '🎉', '🎊', '🎁', '🎈', '🏆', '🥇', '🥈',
      '🥉', '⭐', '🌟', '💫', '⚡', '💥', '💯', '💢', '💬', '👁️‍🗨️',
      '💤', '🔔', '🔕', '🚀', '✈️', '⛵', '🚗', '🚲', '📍', '🗺️',
      '⏳', '⌛', '⏰', '📱', '💻', '📷', '🎧', '🔑', '🔒', '📦'
    ]
  }
];

export default function EmojiPickerPopover({ isOpen, onClose, onSelectEmoji }) {
  const [activeCategory, setActiveCategory] = useState(0);
  const [search, setSearch] = useState('');
  const popoverRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentCategory = EMOJI_CATEGORIES[activeCategory];
  const allEmojis = EMOJI_CATEGORIES.flatMap(c => c.emojis);
  const filteredEmojis = search.trim()
    ? allEmojis // search filter across all
    : currentCategory.emojis;

  return (
    <div
      ref={popoverRef}
      className="absolute bottom-16 left-2 sm:left-4 z-50 w-72 sm:w-80 max-w-[calc(100vw-24px)] bg-white dark:bg-[#17212b] border border-zinc-200 dark:border-[#242f3d] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-150"
    >
      {/* Category Tabs */}
      <div className="flex items-center justify-between px-2 pt-2 border-b border-zinc-100 dark:border-[#242f3d]">
        <div className="flex gap-1">
          {EMOJI_CATEGORIES.map((cat, idx) => (
            <button
              key={cat.name}
              type="button"
              onClick={() => {
                setActiveCategory(idx);
                setSearch('');
              }}
              className={`p-2 text-base rounded-lg transition ${
                activeCategory === idx && !search
                  ? 'bg-[#3390ec]/15 dark:bg-[#5288c1]/20 ring-1 ring-[#3390ec]/30'
                  : 'hover:bg-zinc-100 dark:hover:bg-[#202b36]'
              }`}
              title={cat.name}
            >
              {cat.icon}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-[#202b36]"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Grid */}
      <div className="p-3 grid grid-cols-8 gap-1.5 max-h-56 overflow-y-auto">
        {filteredEmojis.map((emoji, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onSelectEmoji(emoji)}
            className="w-8 h-8 flex items-center justify-center text-lg hover:bg-zinc-100 dark:hover:bg-[#202b36] rounded-lg active:scale-110 transition select-none"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
