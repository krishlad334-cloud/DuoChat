import React from 'react';
import { useChat } from '../../context/ChatContext';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { Lock } from 'lucide-react';

export default function ChatArea() {
  const { activeConversation, isMobileChatOpen } = useChat();

  return (
    <div
      className={`flex-1 flex flex-col h-full bg-[#efeae2] dark:bg-[#0c1317] transition-all ${
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
        /* Authentic WhatsApp Web Empty State */
        <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-[#f0f2f5] dark:bg-[#222e35] border-b-6 border-[#00a884]">
          <div className="max-w-md flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
            {/* WhatsApp Laptop / Device Graphic */}
            <div className="w-64 h-40 mb-6 flex items-center justify-center relative">
              <svg viewBox="0 0 300 200" className="w-full h-full text-[#aebac1] dark:text-[#54656f] fill-current opacity-80">
                <rect x="50" y="30" width="200" height="120" rx="10" fill="none" stroke="currentColor" strokeWidth="6" />
                <rect x="60" y="40" width="180" height="95" rx="4" fill="currentColor" opacity="0.15" />
                <path d="M20 160h260a10 10 0 0 0 10-10v-5H10v5a10 10 0 0 0 10 10z" fill="currentColor" opacity="0.4" />
                <circle cx="150" cy="85" r="22" fill="#00a884" />
                <path d="M143 80a9 9 0 0 0 14 8l3-1-1-3a9 9 0 0 0-16-4z" fill="#fff" />
              </svg>
            </div>

            <h3 className="text-2xl font-light text-[#41525d] dark:text-[#e9edef] tracking-wide mb-3">
              WhatsApp Web
            </h3>
            <p className="text-xs text-[#667781] dark:text-[#8696a0] mb-8 leading-relaxed max-w-sm">
              Send and receive messages in real time. Search any registered user's phone number to start chatting immediately.
            </p>

            <div className="flex items-center gap-1.5 text-xs text-[#8696a0]">
              <Lock className="w-3.5 h-3.5" />
              <span>End-to-end encrypted</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
