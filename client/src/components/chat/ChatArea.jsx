import React from 'react';
import { useChat } from '../../context/ChatContext';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { Send, Lock } from 'lucide-react';

export default function ChatArea() {
  const { activeConversation, isMobileChatOpen } = useChat();

  return (
    <div
      className={`flex-1 flex flex-col h-full bg-[#e6ebf0] dark:bg-[#0e1621] telegram-chat-bg-light dark:telegram-chat-bg-dark transition-all ${
        !isMobileChatOpen ? 'hidden md:flex' : 'flex'
      }`}
    >
      {activeConversation ? (
        <>
          <ChatHeader />
          <MessageList />
          <MessageInput />
        </>
      ) : (
        /* Telegram Empty State: Centered Round Pill */
        <div className="h-full flex flex-col items-center justify-center p-6 text-center">
          <div className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-20 h-20 rounded-full bg-[#3390ec]/15 dark:bg-[#5288c1]/15 text-[#3390ec] dark:text-[#5288c1] flex items-center justify-center mb-4 ring-8 ring-[#3390ec]/5 dark:ring-[#5288c1]/5">
              <Send className="w-9 h-9 fill-[#3390ec] dark:fill-[#5288c1] -translate-x-0.5 translate-y-0.5" />
            </div>

            <div className="px-5 py-2.5 rounded-2xl bg-white/80 dark:bg-[#17212b]/80 backdrop-blur-md border border-[#e4e7ea] dark:border-[#242f3d] shadow-sm max-w-xs">
              <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                Duo Chat Web
              </h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Select a chat or search a phone number to start messaging
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
