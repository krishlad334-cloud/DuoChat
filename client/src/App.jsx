import React from 'react';
import { useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ChatProvider } from './context/ChatContext';
import AuthScreen from './components/auth/AuthScreen';
import Sidebar from './components/sidebar/Sidebar';
import ChatArea from './components/chat/ChatArea';
import ConnectionBanner from './components/common/ConnectionBanner';
import { MessageSquare } from 'lucide-react';

export default function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen h-[100dvh] w-screen flex flex-col items-center justify-center bg-[#0e1621] text-[#3390ec]">
        <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#3390ec] to-[#5288c1] text-white flex items-center justify-center mb-4 shadow-xl shadow-[#3390ec]/25 animate-pulse">
          <MessageSquare className="w-7 h-7" />
        </div>
        <span className="text-sm font-semibold text-zinc-400">
          Loading Duo Chat...
        </span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return (
    <SocketProvider>
      <ChatProvider>
        <div className="h-screen h-[100dvh] w-full flex flex-col bg-zinc-100 dark:bg-[#0e1621] overflow-hidden select-none">
          <ConnectionBanner />
          <div className="flex-1 flex overflow-hidden">
            <Sidebar />
            <ChatArea />
          </div>
        </div>
      </ChatProvider>
    </SocketProvider>
  );
}
