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
      className={`flex-1 flex flex-col h-full bg-slate-50 dark:bg-[#090d16] transition-all ${
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
        /* Modern Duo Chat Empty State */
        <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-slate-50 dark:bg-[#090d16]">
          <div className="max-w-md flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center mb-5 shadow-lg shadow-indigo-500/25">
              <MessageSquare className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight mb-2">
              Duo Chat
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-8 leading-relaxed max-w-sm">
              Instant real-time messaging between users. Search any registered user by their phone number or name to start chatting right away.
            </p>

            <div className="grid grid-cols-2 gap-3 w-full text-left mb-6">
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-start gap-2.5">
                <Zap className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-white">
                    Live Real-Time
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Instant delivery with read receipt ticks.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-start gap-2.5">
                <Shield className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-white">
                    Permanent Data
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Your account and chat history stay saved.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Lock className="w-3.5 h-3.5" />
              <span>Real-time Socket.IO Synchronized</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
