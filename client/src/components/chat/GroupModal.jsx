import React, { useState, useEffect } from 'react';
import { userAPI } from '../../services/api';
import { useChat } from '../../context/ChatContext';
import Avatar from '../common/Avatar';
import { Users, X, Loader2, Check, Phone } from 'lucide-react';

export default function GroupModal({ isOpen, onClose }) {
  const { startGroupChat } = useChat();
  const [title, setTitle] = useState('');
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setTitle('');
      setQuery('');
      setSelectedIds([]);
      setError('');
      return;
    }

    async function loadUsers() {
      try {
        setLoading(true);
        const res = await userAPI.getAll();
        if (res.success && res.users) {
          setUsers(res.users);
        }
      } catch (err) {
        console.error('Failed to load users for group:', err);
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Please provide a group name.');
      return;
    }

    if (selectedIds.length === 0) {
      setError('Please select at least one member.');
      return;
    }

    try {
      setSubmitting(true);
      await startGroupChat(title.trim(), selectedIds);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create group');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(query.toLowerCase()) ||
    (u.phone && u.phone.includes(query)) ||
    u.username.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#121215] w-full max-w-md rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white p-4.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            <h3 className="text-base font-bold">New Group</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleCreate} className="flex-1 flex flex-col overflow-hidden">
          <div className="p-4 space-y-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#18181b]">
            {error && (
              <div className="p-2.5 text-xs text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 rounded-xl">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Group Name
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Design Sprint 🚀"
                className="w-full px-3.5 py-2 bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40 text-zinc-900 dark:text-white placeholder-zinc-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Add Members ({selectedIds.length} selected)
              </label>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name or phone number..."
                className="w-full px-3.5 py-2 bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/40 text-zinc-900 dark:text-white placeholder-zinc-400"
              />
            </div>
          </div>

          {/* Member List */}
          <div className="flex-1 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/60">
            {loading ? (
              <div className="flex items-center justify-center py-8 text-violet-500">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-400">
                No users found.
              </div>
            ) : (
              filteredUsers.map((u) => {
                const isSelected = selectedIds.includes(u.id);
                return (
                  <div
                    key={u.id}
                    onClick={() => toggleSelect(u.id)}
                    className="p-3.5 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-[#18181b] cursor-pointer transition select-none"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar src={u.avatar} name={u.name} size="md" />
                      <div>
                        <div className="text-sm font-semibold text-zinc-900 dark:text-white">
                          {u.name}
                        </div>
                        {u.phone && (
                          <div className="text-xs text-violet-600 dark:text-violet-400 font-medium flex items-center gap-1">
                            <Phone className="w-2.5 h-2.5" />
                            <span>{u.phone}</span>
                          </div>
                        )}
                        <div className="text-[11px] text-zinc-400 truncate">
                          {u.about || 'Hey there! I am using Duo Chat.'}
                        </div>
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center border transition ${
                        isSelected
                          ? 'bg-gradient-to-tr from-violet-600 to-indigo-600 border-violet-600 text-white shadow-sm'
                          : 'border-zinc-300 dark:border-zinc-700'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-3.5 bg-zinc-50 dark:bg-[#18181b] border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-violet-500/25 flex items-center gap-2 transition disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <span>Create Group</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
