import React, { useRef, useEffect, useState, useLayoutEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import MessageBubble from './MessageBubble';
import { getDateSeparator } from '../../utils/dateUtils';
import { ChevronDown, Loader2 } from 'lucide-react';
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

    const isUp = scrollHeight - scrollTop - clientHeight > 150;
    setShowScrollBottom(isUp);

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
  const typingUserNames = Object.values(activeTyping).map(u => u.name || u.phone || u.username);

  return (
    <div
      ref={scrollContainerRef}
      onScroll={handleScroll}
      className="relative flex-1 overflow-y-auto px-4 sm:px-12 md:px-20 lg:px-28 py-3 space-y-1.5 telegram-chat-bg-light dark:telegram-chat-bg-dark"
    >
      {/* Loading older messages spinner */}
      {loadingOlder && (
        <div className="py-2 flex items-center justify-center gap-2 text-xs text-[#3390ec] dark:text-[#5288c1] font-medium">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading older messages...</span>
        </div>
      )}

      {/* Empty State */}
      {!loadingMessages && messages.length === 0 && (
        <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-6">
          <div className="px-4 py-2 bg-black/30 dark:bg-black/50 backdrop-blur-md rounded-2xl text-xs text-white max-w-sm shadow-sm">
            🔒 No messages here yet. Say hello or send a photo!
          </div>
        </div>
      )}

      {/* Messages grouped by date (Telegram Frosted Pill Style) */}
      {messages.map((message, idx) => {
        const currentDateSeparator = getDateSeparator(message.created_at);
        const prevDateSeparator =
          idx > 0 ? getDateSeparator(messages[idx - 1].created_at) : null;
        const showDateSeparator = currentDateSeparator !== prevDateSeparator;

        const isOwn = message.sender_id === user?.id;

        return (
          <React.Fragment key={message.id || idx}>
            {showDateSeparator && (
              <div className="flex items-center justify-center my-3 select-none">
                <span className="px-3.5 py-0.5 bg-black/25 dark:bg-black/45 backdrop-blur-md text-[11px] font-semibold text-white rounded-full shadow-xs">
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

      {/* Typing Indicator Bubble (Telegram Style) */}
      {typingUserNames.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-300 px-3.5 py-1.5 bg-white/90 dark:bg-[#182533] rounded-2xl w-fit shadow-xs border border-[#e4e7ea] dark:border-[#242f3d] animate-in fade-in">
          <div className="flex gap-1 items-center px-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3390ec] dark:bg-[#5288c1] animate-bounce" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#3390ec] dark:bg-[#5288c1] animate-bounce [animation-delay:0.2s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#3390ec] dark:bg-[#5288c1] animate-bounce [animation-delay:0.4s]" />
          </div>
          <span>
            {typingUserNames.join(', ')} typing...
          </span>
        </div>
      )}

      {/* Bottom scroll anchor */}
      <div ref={bottomRef} />

      {/* Telegram Floating Scroll to Bottom button */}
      {showScrollBottom && (
        <button
          onClick={scrollToBottom}
          className="fixed bottom-20 right-6 sm:right-10 p-3 bg-white dark:bg-[#17212b] text-[#3390ec] dark:text-[#5288c1] rounded-full shadow-xl border border-[#e4e7ea] dark:border-[#242f3d] hover:bg-zinc-50 dark:hover:bg-[#202b36] transition active:scale-95 z-30"
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
