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
import { Loader2 } from 'lucide-react';

export default function App() {
  const { isAuthenticated, loading } = useAuth();
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-indigo-600 dark:text-indigo-400">
        <Loader2 className="w-10 h-10 animate-spin mb-3" />
        <span className="text-sm font-medium text-slate-500">Loading Duo Chat...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-screen flex flex-col items-center justify-center p-4 bg-slate-100 dark:bg-slate-950 relative overflow-y-auto">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>

        {authMode === 'login' ? (
          <LoginForm onSwitchToRegister={() => setAuthMode('register')} />
        ) : (
          <RegisterForm onSwitchToLogin={() => setAuthMode('login')} />
        )}
      </div>
    );
  }

  return (
    <SocketProvider>
      <ChatProvider>
        <div className="h-screen w-screen flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden select-none">
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
