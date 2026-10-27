import React, { useRef, useEffect, useState, useLayoutEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import MessageBubble from './MessageBubble';
import { getDateSeparator } from '../../utils/dateUtils';
import { ChevronDown, Loader2, Sparkles } from 'lucide-react';
import ImageModal from './ImageModal';

export default function MessageList() {
  const { user } = useAuth();
  const {
    activeConversation,
    messages,
    loadingMessages,
    loadingOlder,
    hasMoreMessages,
    loadOlderMessages,
    typingUsers,
    deleteMessage
  } = useChat();

  const scrollContainerRef = useRef(null);
  const bottomRef = useRef(null);
  const prevScrollHeightRef = useRef(0);

  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const isInitialLoad = useRef(true);

  // Auto-scroll to bottom on conversation change or new message
  useEffect(() => {
    if (messages.length > 0 && !loadingOlder) {
      if (isInitialLoad.current) {
        bottomRef.current?.scrollIntoView({ behavior: 'auto' });
        isInitialLoad.current = false;
      } else {
        const container = scrollContainerRef.current;
        if (container) {
          const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 200;
          if (isNearBottom) {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }
    }
  }, [messages, loadingOlder]);

  // Reset initial load flag on conversation change
  useEffect(() => {
    isInitialLoad.current = true;
  }, [activeConversation?.id]);

  // Preserve scroll position when loading older messages
  useLayoutEffect(() => {
    if (loadingOlder) {
      const container = scrollContainerRef.current;
      if (container) {
        prevScrollHeightRef.current = container.scrollHeight;
      }
    } else if (prevScrollHeightRef.current > 0) {
      const container = scrollContainerRef.current;
      if (container) {
        const heightDifference = container.scrollHeight - prevScrollHeightRef.current;
        container.scrollTop += heightDifference;
      }
      prevScrollHeightRef.current = 0;
    }
  }, [loadingOlder, messages]);

  // Scroll event listener: check top for pagination and bottom button visibility
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

    // Show "scroll to bottom" button if scrolled up > 150px
    const isUp = scrollHeight - scrollTop - clientHeight > 150;
    setShowScrollBottom(isUp);

    // Infinite scroll up: if scrolled near top (<= 40px)
    if (scrollTop <= 40 && hasMoreMessages && !loadingOlder && !loadingMessages) {
      prevScrollHeightRef.current = scrollHeight;
      loadOlderMessages();
    }
  };

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    setShowScrollBottom(false);
  };

  const handleDeleteMessage = (messageId) => {
    if (confirm('Delete this message for everyone?')) {
      deleteMessage(messageId);
    }
  };

  // Typing indicator users for active conversation
  const activeTyping = typingUsers[activeConversation?.id] || {};
  const typingUserNames = Object.values(activeTyping).map(u => u.name || u.username);

  return (
    <div
      ref={scrollContainerRef}
      onScroll={handleScroll}
      className="relative flex-1 overflow-y-auto px-4 py-3 space-y-1 bg-slate-50/50 dark:bg-slate-950/40"
    >
      {/* Loading older messages spinner */}
      {loadingOlder && (
        <div className="py-2 flex items-center justify-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading older messages...</span>
        </div>
      )}

      {/* Empty State */}
      {!loadingMessages && messages.length === 0 && (
        <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-6 text-slate-400">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-500 flex items-center justify-center mb-3">
            <Sparkles className="w-7 h-7" />
          </div>
          <h4 className="text-base font-semibold text-slate-700 dark:text-slate-300">
            No messages yet
          </h4>
          <p className="text-xs text-slate-500 max-w-xs mt-1">
            Send a message or share a photo to break the ice!
          </p>
        </div>
      )}

      {/* Messages grouped by date */}
      {messages.map((message, idx) => {
        const currentDateSeparator = getDateSeparator(message.created_at);
        const prevDateSeparator =
          idx > 0 ? getDateSeparator(messages[idx - 1].created_at) : null;
        const showDateSeparator = currentDateSeparator !== prevDateSeparator;

        const isOwn = message.sender_id === user?.id;

        return (
          <React.Fragment key={message.id || idx}>
            {showDateSeparator && (
              <div className="flex items-center justify-center my-4">
                <span className="px-3 py-1 bg-slate-200/80 dark:bg-slate-800 text-[11px] font-medium text-slate-600 dark:text-slate-300 rounded-full shadow-xs">
                  {currentDateSeparator}
                </span>
              </div>
            )}

            <MessageBubble
              message={message}
              isOwn={isOwn}
              isGroup={Boolean(activeConversation?.is_group)}
              onDelete={handleDeleteMessage}
              onImageClick={(url) => setSelectedImage(url)}
            />
          </React.Fragment>
        );
      })}

      {/* Typing Indicator Bubble */}
      {typingUserNames.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 p-2 bg-white/70 dark:bg-slate-800/70 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl w-fit shadow-xs animate-in fade-in">
          <div className="flex gap-1 items-center px-1">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce-dot-1" />
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce-dot-2" />
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce-dot-3" />
          </div>
          <span>
            {typingUserNames.join(', ')} {typingUserNames.length === 1 ? 'is' : 'are'} typing...
          </span>
        </div>
      )}

      {/* Invisible anchor to scroll down to */}
      <div ref={bottomRef} />

      {/* Floating Scroll to Bottom button */}
      {showScrollBottom && (
        <button
          onClick={scrollToBottom}
          className="fixed bottom-20 right-6 sm:right-10 p-2.5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-200 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition active:scale-95 z-30"
          title="Scroll to bottom"
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      )}

      {/* Lightbox Modal */}
      {selectedImage && (
        <ImageModal
          src={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
}
