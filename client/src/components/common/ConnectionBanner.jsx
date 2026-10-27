import React from 'react';
import { useSocket } from '../../context/SocketContext';
import { WifiOff, RefreshCw } from 'lucide-react';

export default function ConnectionBanner() {
  const { connected, connecting, reconnect } = useSocket();

  if (connected) return null;

  return (
    <div className="bg-amber-500/90 dark:bg-amber-600/90 text-white text-xs font-medium py-1.5 px-4 flex items-center justify-between shadow-md transition-all z-50">
      <div className="flex items-center gap-2">
        {connecting ? (
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <WifiOff className="w-3.5 h-3.5" />
        )}
        <span>
          {connecting
            ? 'Connecting to chat server...'
            : 'Connection lost. Offline messages will be queued.'}
        </span>
      </div>
      {!connecting && (
        <button
          onClick={reconnect}
          className="ml-4 px-2 py-0.5 bg-white/20 hover:bg-white/30 rounded text-[11px] font-semibold transition"
        >
          Reconnect
        </button>
      )}
    </div>
  );
}
