import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export function SocketProvider({ children }) {
  const { token, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const socketRef = useRef(null);

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

    const s = io(SOCKET_URL, {
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
        // the server disconnected the socket, need to manually reconnect
        s.connect();
      }
      setConnecting(true);
    });

    s.on('connect_error', (err) => {
      setConnected(false);
      setConnecting(true);
      setConnectionError(err.message || 'Connection error');
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
  }, [isAuthenticated, token]);

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
