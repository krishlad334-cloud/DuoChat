import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ChatProvider } from './context/ChatContext';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import Sidebar from './components/sidebar/Sidebar';
import ChatArea from './components/chat/ChatArea';
import ConnectionBanner from './components/common/ConnectionBanner';
import ThemeToggle from './components/common/ThemeToggle';
import { Loader2, MessageSquare } from 'lucide-react';

export default function App() {
  const { isAuthenticated, loading } = useAuth();
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-[#09090b] text-violet-600 dark:text-violet-400">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center mb-4 shadow-xl shadow-violet-500/25 animate-pulse">
          <MessageSquare className="w-7 h-7" />
        </div>
        <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          Loading Duo Chat...
        </span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-screen flex flex-col items-center justify-center p-4 bg-zinc-100 dark:bg-[#09090b] relative overflow-y-auto">
        {/* Minimalist Ambient Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-gradient-to-tr from-violet-600/10 to-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-4xl z-10 flex items-center justify-between px-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-violet-500/20">
              <MessageSquare className="w-4 h-4" />
            </div>
            <span className="font-bold text-base text-zinc-900 dark:text-white tracking-tight">Duo Chat</span>
          </div>
          <ThemeToggle />
        </div>

        <div className="z-10 w-full flex justify-center">
          {authMode === 'login' ? (
            <LoginForm onSwitchToRegister={() => setAuthMode('register')} />
          ) : (
            <RegisterForm onSwitchToLogin={() => setAuthMode('login')} />
          )}
        </div>
      </div>
    );
  }

  return (
    <SocketProvider>
      <ChatProvider>
        <div className="h-screen w-screen flex flex-col bg-zinc-100 dark:bg-[#09090b] overflow-hidden select-none">
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
