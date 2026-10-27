import React, { useState, useEffect } from 'react';
import { userAPI } from '../../services/api';
import { useChat } from '../../context/ChatContext';
import Avatar from '../common/Avatar';
import { Search, X, Loader2, MessageSquarePlus } from 'lucide-react';

export default function SearchUserModal({ isOpen, onClose }) {
  const { startDirectChat, onlinePresence } = useChat();
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setUsers([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await userAPI.search(query);
        if (res.success && res.users) {
          setUsers(res.users);
        }
      } catch (err) {
        console.error('User search error:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [isOpen, query]);

  if (!isOpen) return null;

  const handleSelectUser = async (userId) => {
    try {
      setSubmitting(true);
      await startDirectChat(userId);
      onClose();
    } catch (err) {
      console.error('Failed to start chat:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquarePlus className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Start a Conversation
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search input */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, username or email..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white placeholder-slate-400"
            />
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-2 divide-y divide-slate-100 dark:divide-slate-800/60">
          {loading ? (
            <div className="flex items-center justify-center py-10 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400">
              No users found matching "{query}"
            </div>
          ) : (
            users.map((u) => {
              const presence = onlinePresence[u.id];
              const isOnline = presence?.status === 'online' || u.status === 'online';

              return (
                <button
                  key={u.id}
                  disabled={submitting}
                  onClick={() => handleSelectUser(u.id)}
                  className="w-full p-2.5 flex items-center gap-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 text-left transition"
                >
                  <Avatar
                    src={u.avatar}
                    name={u.name}
                    size="md"
                    showStatus={true}
                    isOnline={isOnline}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {u.name}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      @{u.username} • {isOnline ? 'Online' : 'Offline'}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
