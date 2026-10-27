import React from 'react';
import { useChat } from '../../context/ChatContext';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { MessageSquare, Lock, Zap, Shield } from 'lucide-react';

export default function ChatArea() {
  const { activeConversation, isMobileChatOpen } = useChat();

  return (
    <div
      className={`flex-1 flex flex-col h-full bg-zinc-50 dark:bg-[#09090b] transition-all ${
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
        /* Minimalist Modern Studio Empty State */
        <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-zinc-50 dark:bg-[#09090b]">
          <div className="max-w-md flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center mb-5 shadow-xl shadow-violet-500/25">
              <MessageSquare className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight mb-2">
              Duo Chat
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-8 leading-relaxed max-w-sm">
              Instant real-time messaging. Search any registered contact by their phone number or name to start chatting right away.
            </p>

            <div className="grid grid-cols-2 gap-3 w-full text-left mb-6">
              <div className="p-3.5 bg-white dark:bg-[#121215] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 flex items-start gap-3 shadow-xs">
                <Zap className="w-4 h-4 text-violet-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-semibold text-zinc-900 dark:text-white">
                    Live Real-Time
                  </h4>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Instant delivery with read receipt ticks.
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-white dark:bg-[#121215] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 flex items-start gap-3 shadow-xs">
                <Shield className="w-4 h-4 text-violet-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-semibold text-zinc-900 dark:text-white">
                    Permanent Data
                  </h4>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Your profile and chats remain saved.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              <Lock className="w-3.5 h-3.5" />
              <span>Real-time Socket.IO Synchronized</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
