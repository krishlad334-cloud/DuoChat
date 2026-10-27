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
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#efeae2] dark:bg-[#0c1317] text-[#00a884]">
        <div className="w-16 h-16 rounded-full bg-[#00a884] text-white flex items-center justify-center mb-4 shadow-lg shadow-[#00a884]/20 animate-pulse">
          <svg className="w-9 h-9 fill-current" viewBox="0 0 24 24">
            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.311.045-.698.077-2.222-.556-1.954-.809-3.21-2.805-3.308-2.935-.098-.13-1.012-1.344-1.012-2.564 0-1.22.637-1.82.863-2.066.226-.246.494-.307.659-.307.164 0 .328.002.472.01.152.008.356-.058.558.428.207.498.706 1.722.768 1.848.062.126.103.273.02.437-.083.164-.124.266-.246.409-.123.144-.258.321-.369.431-.123.123-.252.257-.108.504.144.246.64 1.058 1.373 1.712.943.84 1.737 1.1 1.983 1.223.246.124.391.103.535-.062.144-.164.617-.719.782-.965.164-.246.329-.205.556-.123.226.082 1.436.677 1.683.8.246.123.411.185.472.288.062.103.062.597-.082 1.002z" />
          </svg>
        </div>
        <span className="text-sm font-medium text-[#667781] dark:text-[#8696a0]">
          Loading WhatsApp Web...
        </span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-screen flex flex-col items-center justify-center p-4 bg-[#d1d7db] dark:bg-[#0c1317] relative overflow-y-auto">
        {/* WhatsApp Top Green Banner in Light Mode */}
        <div className="absolute top-0 left-0 right-0 h-44 bg-[#00a884] dark:bg-[#202c33] z-0" />

        <div className="w-full max-w-4xl z-10 flex items-center justify-between px-4 mb-4">
          <div className="flex items-center gap-3 text-white">
            <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.311.045-.698.077-2.222-.556-1.954-.809-3.21-2.805-3.308-2.935-.098-.13-1.012-1.344-1.012-2.564 0-1.22.637-1.82.863-2.066.226-.246.494-.307.659-.307.164 0 .328.002.472.01.152.008.356-.058.558.428.207.498.706 1.722.768 1.848.062.126.103.273.02.437-.083.164-.124.266-.246.409-.123.144-.258.321-.369.431-.123.123-.252.257-.108.504.144.246.64 1.058 1.373 1.712.943.84 1.737 1.1 1.983 1.223.246.124.391.103.535-.062.144-.164.617-.719.782-.965.164-.246.329-.205.556-.123.226.082 1.436.677 1.683.8.246.123.411.185.472.288.062.103.062.597-.082 1.002z" />
            </svg>
            <span className="font-semibold text-sm tracking-wider uppercase">WhatsApp Web</span>
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
        <div className="h-screen w-screen flex flex-col bg-[#efeae2] dark:bg-[#0c1317] overflow-hidden select-none">
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
