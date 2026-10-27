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
      className="relative flex-1 overflow-y-auto px-4 sm:px-12 py-3 space-y-1 wa-chat-bg-light dark:wa-chat-bg-dark"
    >
      {/* Loading older messages spinner */}
      {loadingOlder && (
        <div className="py-2 flex items-center justify-center gap-2 text-xs text-[#00a884] font-medium">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading older messages...</span>
        </div>
      )}

      {/* Empty State */}
      {!loadingMessages && messages.length === 0 && (
        <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-6 text-[#8696a0]">
          <div className="px-4 py-2 bg-white/80 dark:bg-[#182229]/80 backdrop-blur-xs rounded-lg shadow-xs text-xs text-[#54656f] dark:text-[#aebac1] max-w-sm">
            🔒 Messages are end-to-end synchronized in real-time. Say hello to start the chat!
          </div>
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
              <div className="flex items-center justify-center my-3">
                <span className="px-3 py-1 bg-white/90 dark:bg-[#182229]/90 text-[11px] font-semibold tracking-wider text-[#54656f] dark:text-[#8696a0] rounded-md shadow-xs uppercase">
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

      {/* WhatsApp Typing Indicator Bubble */}
      {typingUserNames.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-[#54656f] dark:text-[#aebac1] px-3 py-1.5 bg-white dark:bg-[#202c33] rounded-lg w-fit shadow-xs animate-in fade-in">
          <div className="flex gap-1 items-center px-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00a884] animate-bounce-dot-1" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#00a884] animate-bounce-dot-2" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#00a884] animate-bounce-dot-3" />
          </div>
          <span>
            {typingUserNames.join(', ')} typing...
          </span>
        </div>
      )}

      {/* Bottom scroll anchor */}
      <div ref={bottomRef} />

      {/* Floating Scroll to Bottom button */}
      {showScrollBottom && (
        <button
          onClick={scrollToBottom}
          className="fixed bottom-20 right-6 sm:right-10 p-2.5 bg-white dark:bg-[#202c33] text-[#54656f] dark:text-[#aebac1] rounded-full shadow-lg border border-[#e9edef] dark:border-[#222d34] hover:bg-[#f0f2f5] dark:hover:bg-[#2a3942] transition active:scale-95 z-30"
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
