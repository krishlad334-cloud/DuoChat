import React from 'react';
import { useChat } from '../../context/ChatContext';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { MessageSquare, Shield, Zap, Lock } from 'lucide-react';

export default function ChatArea() {
  const { activeConversation, isMobileChatOpen } = useChat();

  return (
    <div
      className={`flex-1 flex flex-col h-full bg-slate-100 dark:bg-slate-950 transition-all ${
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
        /* Empty Welcome Hero State */
        <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-slate-50 dark:bg-slate-950">
          <div className="max-w-md flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-20 h-20 rounded-3xl bg-indigo-600/10 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-6 shadow-inner">
              <MessageSquare className="w-10 h-10" />
            </div>

            <h3 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight mb-2">
              Duo Chat Real-time
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
              Select an existing conversation from the sidebar or search for users to start chatting instantly.
            </p>

            <div className="grid grid-cols-2 gap-4 w-full text-left">
              <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-start gap-3">
                <Zap className="w-5 h-5 text-indigo-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-white">
                    Instant Delivery
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Real-time Socket.IO synchronization with zero refresh.
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-start gap-3">
                <Lock className="w-5 h-5 text-indigo-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-white">
                    Tick Receipts
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Sent, delivered, and read status indicators.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
