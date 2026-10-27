import React, { useState, useEffect } from 'react';
import { userAPI } from '../../services/api';
import { useChat } from '../../context/ChatContext';
import Avatar from '../common/Avatar';
import { Search, ArrowLeft, Loader2, Phone, X, User } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#17212b] w-full max-w-md rounded-3xl shadow-2xl border border-zinc-200 dark:border-[#242f3d] overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Telegram Header */}
        <div className="bg-[#3390ec] dark:bg-[#5288c1] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 transition"
              title="Close"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h3 className="text-base font-bold tracking-tight">New Message</h3>
              <p className="text-xs text-white/80">Search by phone number or name</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="p-3 bg-zinc-50 dark:bg-[#0e1621] border-b border-zinc-200 dark:border-[#242f3d]">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search phone number (e.g. +91 99999 88888)..."
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#17212b] border border-zinc-200 dark:border-[#242f3d] rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#3390ec]/50 dark:focus:ring-[#5288c1]/50 text-zinc-900 dark:text-white placeholder-zinc-400 transition"
            />
          </div>
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto divide-y divide-zinc-100 dark:divide-[#242f3d]/50">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-[#3390ec] dark:text-[#5288c1]">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <div className="py-12 px-6 text-center text-zinc-400">
              <Phone className="w-10 h-10 mx-auto mb-2 text-[#3390ec]/30 dark:text-[#5288c1]/30" />
              <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                {query ? 'No contact found' : 'Search contacts by phone'}
              </p>
              <p className="text-xs mt-1 text-zinc-500">
                {query
                  ? `No user registered with "${query}". Enter their registered phone number.`
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
                  type="button"
                  disabled={submitting}
                  onClick={() => handleSelectUser(u.id)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-zinc-100 dark:hover:bg-[#202b36] transition text-left group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar
                      src={u.avatar}
                      name={u.name}
                      size="md"
                      showStatus={true}
                      isOnline={isOnline}
                    />
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
                        {u.name}
                      </h4>
                      {u.phone ? (
                        <p className="text-xs text-[#3390ec] dark:text-[#5288c1] font-mono flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 inline" />
                          <span>{u.phone}</span>
                        </p>
                      ) : (
                        <p className="text-xs text-zinc-400 truncate mt-0.5">
                          @{u.username}
                        </p>
                      )}
                      {u.about && (
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                          {u.about}
                        </p>
                      )}
                    </div>
                  </div>

                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#3390ec]/10 dark:bg-[#5288c1]/20 text-[#3390ec] dark:text-[#5288c1] group-hover:bg-[#3390ec] group-hover:text-white transition">
                    Chat
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
