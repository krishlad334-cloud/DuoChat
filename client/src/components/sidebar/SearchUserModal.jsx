import React, { useState, useEffect } from 'react';
import { userAPI } from '../../services/api';
import { useChat } from '../../context/ChatContext';
import Avatar from '../common/Avatar';
import { Search, ArrowLeft, Loader2, Phone, MessageSquarePlus } from 'lucide-react';

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
    }, 200);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#121215] w-full max-w-md rounded-3xl shadow-2xl shadow-black/50 border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Royal Violet & Indigo Header */}
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white p-4.5 flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/10 transition"
            title="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h3 className="text-base font-bold tracking-tight">New Chat</h3>
            <p className="text-xs text-violet-100">Search by phone number or name</p>
          </div>
        </div>

        {/* Search Input Box */}
        <div className="p-3.5 bg-zinc-50 dark:bg-[#18181b] border-b border-zinc-200 dark:border-zinc-800">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search phone number (e.g. +91 99999 88888)..."
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-zinc-900 dark:text-white placeholder-zinc-400 transition"
            />
          </div>
        </div>

        {/* Contacts Results */}
        <div className="flex-1 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/60">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-violet-500">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <div className="py-12 px-6 text-center text-zinc-400">
              <Phone className="w-10 h-10 mx-auto mb-2 text-violet-500/30" />
              <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                {query ? 'No contact found' : 'Search by phone number'}
              </p>
              <p className="text-xs mt-1 text-zinc-500">
                {query
                  ? `No user registered with "${query}". Make sure the contact created an account with that number.`
                  : 'Enter a registered user\'s phone number to start chatting immediately.'}
              </p>
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
                  className="w-full px-4 py-3 flex items-center gap-3.5 hover:bg-zinc-50 dark:hover:bg-[#18181b] text-left transition select-none group"
                >
                  <Avatar
                    src={u.avatar}
                    name={u.name}
                    size="lg"
                    showStatus={true}
                    isOnline={isOnline}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
                        {u.name}
                      </span>
                      {isOnline && (
                        <span className="text-[10px] text-emerald-500 font-semibold">
                          Online
                        </span>
                      )}
                    </div>
                    {u.phone && (
                      <div className="flex items-center gap-1 text-xs text-violet-600 dark:text-violet-400 font-medium mt-0.5">
                        <Phone className="w-3 h-3" />
                        <span>{u.phone}</span>
                      </div>
                    )}
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                      {u.about || 'Hey there! I am using Duo Chat.'}
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
