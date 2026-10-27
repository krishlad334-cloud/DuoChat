import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export function getSocketUrl() {
  if (typeof window !== 'undefined') {
    const customSocket = localStorage.getItem('duochat_socket_url');
    if (customSocket && customSocket.trim()) return customSocket.trim().replace(/\/+$/, '');

    const customApi = localStorage.getItem('duochat_api_url');
    if (customApi && customApi.trim()) {
      return customApi.trim().replace(/\/api\/?$/, '');
    }
  }

  const envSocket = import.meta.env.VITE_SOCKET_URL;
  if (envSocket && envSocket.trim()) return envSocket.trim().replace(/\/+$/, '');

  const envApi = import.meta.env.VITE_API_URL;
  if (envApi && envApi.trim()) return envApi.trim().replace(/\/api\/?$/, '');

  if (typeof window !== 'undefined' && window.location) {
    const { hostname, origin } = window.location;
    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0';
    if (!isLocal) {
      return origin;
    }
  }

  return 'http://localhost:5000';
}

export function SocketProvider({ children }) {
  const { token, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [activeUrl, setActiveUrl] = useState(getSocketUrl());
  const socketRef = useRef(null);

  // Listen to API URL change events
  useEffect(() => {
    const handleUrlChange = () => {
      setActiveUrl(getSocketUrl());
    };
    window.addEventListener('duochat:api-url-changed', handleUrlChange);
    return () => window.removeEventListener('duochat:api-url-changed', handleUrlChange);
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setConnected(false);
        setConnecting(false);
      }
      return;
    }

    setConnecting(true);

    const s = io(activeUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    s.on('connect', () => {
      setConnected(true);
      setConnecting(false);
      setConnectionError(null);
    });

    s.on('disconnect', (reason) => {
      setConnected(false);
      if (reason === 'io server disconnect') {
        s.connect();
      }
      setConnecting(true);
    });

    s.on('connect_error', (err) => {
      setConnected(false);
      setConnecting(true);
      setConnectionError(err.message || 'Socket connection error');
    });

    s.on('reconnect', () => {
      setConnected(true);
      setConnecting(false);
      setConnectionError(null);
    });

    socketRef.current = s;
    setSocket(s);

    return () => {
      s.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, token, activeUrl]);

  const reconnect = () => {
    if (socketRef.current) {
      setConnecting(true);
      socketRef.current.connect();
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        connected,
        connecting,
        connectionError,
        socketUrl: activeUrl,
        reconnect,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
