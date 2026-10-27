import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { chatAPI, messageAPI } from '../services/api';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';

const ChatContext = createContext();

export function ChatProvider({ children }) {
  const { user } = useAuth();
  const { socket, connected } = useSocket();

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [typingUsers, setTypingUsers] = useState({}); // { [convId]: { [userId]: { name, username } } }
  const [onlinePresence, setOnlinePresence] = useState({}); // { [userId]: { status, lastSeen } }
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);

  const activeConvRef = useRef(activeConversation);
  activeConvRef.current = activeConversation;

  const typingTimeoutRef = useRef(null);

  // 1. Fetch conversations on load / user change
  const fetchConversations = useCallback(async () => {
    if (!user) return;
    try {
      setLoadingConversations(true);
      const res = await chatAPI.getChats();
      if (res.success && res.conversations) {
        setConversations(res.conversations);

        // Gather all participant IDs to check presence
        const participantIds = new Set();
        res.conversations.forEach(c => {
          c.members?.forEach(m => participantIds.add(m.id));
        });

        if (socket && connected && participantIds.size > 0) {
          socket.emit('check_presence', Array.from(participantIds), (statuses) => {
            if (statuses) {
              setOnlinePresence(prev => ({ ...prev, ...statuses }));
            }
          });
        }
      }
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
    } finally {
      setLoadingConversations(false);
    }
  }, [user, socket, connected]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // 2. Fetch messages for active conversation
  const fetchMessages = useCallback(async (conversationId) => {
    try {
      setLoadingMessages(true);
      const res = await messageAPI.getMessages(conversationId, { limit: 30 });
      if (res.success && res.messages) {
        setMessages(res.messages);
        setHasMoreMessages(res.hasMore);

        // Mark read
        if (res.messages.length > 0) {
          const latestId = res.messages[res.messages.length - 1].id;
          chatAPI.markAsRead(conversationId, latestId).catch(() => {});
          if (socket && connected) {
            socket.emit('message_read', { conversationId, messageId: latestId });
          }
        }
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  }, [socket, connected]);

  // Load older messages (infinite scroll up)
  const loadOlderMessages = async () => {
    if (!activeConversation || loadingOlder || !hasMoreMessages || messages.length === 0) return 0;
    try {
      setLoadingOlder(true);
      const oldestId = messages[0].id;
      const res = await messageAPI.getMessages(activeConversation.id, {
        limit: 30,
        before: oldestId,
      });
      if (res.success && res.messages) {
        setMessages(prev => [...res.messages, ...prev]);
        setHasMoreMessages(res.hasMore);
        return res.messages.length;
      }
      return 0;
    } catch (err) {
      console.error('Failed to load older messages:', err);
      return 0;
    } finally {
      setLoadingOlder(false);
    }
  };

  // 3. Select active conversation
  const selectConversation = (conv) => {
    if (activeConversation?.id === conv.id) {
      setIsMobileChatOpen(true);
      return;
    }

    if (activeConversation && socket && connected) {
      socket.emit('leave_conversation', activeConversation.id);
    }

    setActiveConversation(conv);
    setIsMobileChatOpen(true);
    setMessages([]);

    if (socket && connected) {
      socket.emit('join_conversation', conv.id);
    }

    // Reset unread count locally in list
    setConversations(prev =>
      prev.map(c => (c.id === conv.id ? { ...c, unread_count: 0 } : c))
    );

    fetchMessages(conv.id);
  };

  const closeMobileChat = () => {
    setIsMobileChatOpen(false);
  };

  // 4. Socket real-time events
  useEffect(() => {
    if (!socket || !connected) return;

    // Join room if active conversation exists
    if (activeConversation) {
      socket.emit('join_conversation', activeConversation.id);
    }

    // Handle incoming new message
    const handleNewMessage = (newMessage) => {
      const currentActive = activeConvRef.current;
      const isCurrentChat = currentActive && currentActive.id === newMessage.conversation_id;

      if (isCurrentChat) {
        setMessages(prev => {
          if (prev.some(m => m.id === newMessage.id)) return prev;
          return [...prev, newMessage];
        });

        // If from another user, mark read immediately
        if (newMessage.sender_id !== user?.id) {
          socket.emit('message_read', {
            conversationId: newMessage.conversation_id,
            messageId: newMessage.id
          });
          chatAPI.markAsRead(newMessage.conversation_id, newMessage.id).catch(() => {});
        }
      } else {
        // Not active chat: if message from other user, emit delivery receipt
        if (newMessage.sender_id !== user?.id) {
          socket.emit('message_delivered', {
            messageId: newMessage.id,
            conversationId: newMessage.conversation_id
          });
        }
      }

      // Update conversations list (bump to top, update last_message and unread)
      setConversations(prev => {
        let updatedConv = prev.find(c => c.id === newMessage.conversation_id);
        const others = prev.filter(c => c.id !== newMessage.conversation_id);

        if (updatedConv) {
          const isSender = newMessage.sender_id === user?.id;
          const shouldIncrementUnread = !isCurrentChat && !isSender;

          updatedConv = {
            ...updatedConv,
            last_message: newMessage,
            unread_count: shouldIncrementUnread
              ? (updatedConv.unread_count || 0) + 1
              : (isCurrentChat ? 0 : updatedConv.unread_count || 0),
            updated_at: newMessage.created_at
          };
          return [updatedConv, ...others];
        } else {
          // If conversation not in list, fetch all conversations
          fetchConversations();
          return prev;
        }
      });
    };

    // Handle messages read
    const handleMessagesRead = ({ conversationId, lastReadMessageId }) => {
      const currentActive = activeConvRef.current;
      if (currentActive && currentActive.id === conversationId) {
        setMessages(prev =>
          prev.map(m =>
            m.id <= lastReadMessageId ? { ...m, status: 'read' } : m
          )
        );
      }
    };

    // Handle delivery status update
    const handleStatusUpdate = ({ messageId, status }) => {
      setMessages(prev =>
        prev.map(m => (m.id === messageId ? { ...m, status } : m))
      );
    };

    // Handle message deleted
    const handleMessageDeleted = ({ messageId, conversationId, message }) => {
      const currentActive = activeConvRef.current;
      if (currentActive && currentActive.id === conversationId) {
        setMessages(prev =>
          prev.map(m =>
            m.id === messageId ? { ...m, is_deleted: 1, content: 'This message was deleted', file_url: null, file_name: null } : m
          )
        );
      }
      setConversations(prev =>
        prev.map(c => {
          if (c.id === conversationId && c.last_message?.id === messageId) {
            return {
              ...c,
              last_message: { ...c.last_message, is_deleted: 1, content: 'This message was deleted' }
            };
          }
          return c;
        })
      );
    };

    // Handle user presence
    const handleUserPresence = ({ userId, status, lastSeen }) => {
      setOnlinePresence(prev => ({
        ...prev,
        [userId]: { status, lastSeen }
      }));

      // Update in conversation members
      setConversations(prev =>
        prev.map(c => {
          const members = c.members?.map(m =>
            m.id === userId ? { ...m, status, last_seen: lastSeen || m.last_seen } : m
          );
          const other_user = c.other_user?.id === userId
            ? { ...c.other_user, status, last_seen: lastSeen || c.other_user.last_seen }
            : c.other_user;

          return { ...c, members, other_user };
        })
      );

      // Update in activeConversation if matches
      setActiveConversation(prev => {
        if (!prev) return null;
        const members = prev.members?.map(m =>
          m.id === userId ? { ...m, status, last_seen: lastSeen || m.last_seen } : m
        );
        const other_user = prev.other_user?.id === userId
          ? { ...prev.other_user, status, last_seen: lastSeen || prev.other_user.last_seen }
          : prev.other_user;
        return { ...prev, members, other_user };
      });
    };

    // Handle user typing
    const handleUserTyping = ({ conversationId, userId, name, username }) => {
      if (userId === user?.id) return;
      setTypingUsers(prev => ({
        ...prev,
        [conversationId]: {
          ...(prev[conversationId] || {}),
          [userId]: { name, username }
        }
      }));
    };

    // Handle user stopped typing
    const handleUserStoppedTyping = ({ conversationId, userId }) => {
      setTypingUsers(prev => {
        const convTyping = { ...(prev[conversationId] || {}) };
        delete convTyping[userId];
        return {
          ...prev,
          [conversationId]: convTyping
        };
      });
    };

    socket.on('new_message', handleNewMessage);
    socket.on('messages_read', handleMessagesRead);
    socket.on('message_status_updated', handleStatusUpdate);
    socket.on('message_deleted', handleMessageDeleted);
    socket.on('user_presence', handleUserPresence);
    socket.on('user_typing', handleUserTyping);
    socket.on('user_stopped_typing', handleUserStoppedTyping);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('messages_read', handleMessagesRead);
      socket.off('message_status_updated', handleStatusUpdate);
      socket.off('message_deleted', handleMessageDeleted);
      socket.off('user_presence', handleUserPresence);
      socket.off('user_typing', handleUserTyping);
      socket.off('user_stopped_typing', handleUserStoppedTyping);
    };
  }, [socket, connected, user, fetchConversations]);

  // 5. Send message action
  const sendMessage = async ({ content, file, type }) => {
    if (!activeConversation) return;

    let fileUrl = null;
    let fileName = null;
    let fileSize = null;
    let fileMime = null;
    let msgType = type || 'text';

    // Handle file upload if present
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await messageAPI.uploadFile(formData);
      if (uploadRes.success && uploadRes.file) {
        fileUrl = uploadRes.file.url;
        fileName = uploadRes.file.fileName;
        fileSize = uploadRes.file.fileSize;
        fileMime = uploadRes.file.fileMime;
        msgType = uploadRes.file.type;
      }
    }

    const payload = {
      conversationId: activeConversation.id,
      content: content ? content.trim() : '',
      type: msgType,
      fileUrl,
      fileName,
      fileSize,
      fileMime
    };

    // Send via socket if connected
    if (socket && connected) {
      return new Promise((resolve, reject) => {
        socket.emit('send_message', payload, (response) => {
          if (response?.success) {
            resolve(response.message);
          } else {
            // Fallback to HTTP API
            messageAPI.sendMessage(activeConversation.id, payload)
              .then(res => resolve(res.message))
              .catch(reject);
          }
        });
      });
    } else {
      // Fallback HTTP
      const res = await messageAPI.sendMessage(activeConversation.id, payload);
      return res.message;
    }
  };

  // 6. Delete message action
  const deleteMessage = async (messageId) => {
    if (!activeConversation) return;

    if (socket && connected) {
      return new Promise((resolve, reject) => {
        socket.emit('delete_message', { messageId, conversationId: activeConversation.id }, (response) => {
          if (response?.success) {
            resolve(response.message);
          } else {
            messageAPI.deleteMessage(messageId).then(resolve).catch(reject);
          }
        });
      });
    } else {
      return await messageAPI.deleteMessage(messageId);
    }
  };

  // 7. Typing helpers
  const emitTypingStart = () => {
    if (!activeConversation || !socket || !connected) return;
    socket.emit('typing_start', { conversationId: activeConversation.id });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      emitTypingStop();
    }, 3000);
  };

  const emitTypingStop = () => {
    if (!activeConversation || !socket || !connected) return;
    socket.emit('typing_stop', { conversationId: activeConversation.id });
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  };

  // 8. Create Direct Chat
  const startDirectChat = async (targetUserId) => {
    const res = await chatAPI.createDirect(targetUserId);
    if (res.success && res.conversation) {
      await fetchConversations();
      selectConversation(res.conversation);
      return res.conversation;
    }
  };

  // 9. Create Group Chat
  const startGroupChat = async (title, memberIds) => {
    const res = await chatAPI.createGroup(title, memberIds);
    if (res.success && res.conversation) {
      await fetchConversations();
      selectConversation(res.conversation);
      return res.conversation;
    }
  };

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeConversation,
        messages,
        loadingConversations,
        loadingMessages,
        loadingOlder,
        hasMoreMessages,
        typingUsers,
        onlinePresence,
        isMobileChatOpen,
        selectConversation,
        closeMobileChat,
        loadOlderMessages,
        sendMessage,
        deleteMessage,
        emitTypingStart,
        emitTypingStop,
        startDirectChat,
        startGroupChat,
        fetchConversations,
        setActiveConversation
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
