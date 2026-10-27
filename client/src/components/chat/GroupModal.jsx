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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white p-4 flex items-center justify-between">
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
          <div className="p-4 space-y-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
            {error && (
              <div className="p-2.5 text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Group Name
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Design Sprint 🚀"
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-slate-900 dark:text-white placeholder-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Add Members ({selectedIds.length} selected)
              </label>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name or phone number..."
                className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-slate-900 dark:text-white placeholder-slate-400"
              />
            </div>
          </div>

          {/* Member List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {loading ? (
              <div className="flex items-center justify-center py-8 text-indigo-600 dark:text-indigo-400">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No users found.
              </div>
            ) : (
              filteredUsers.map((u) => {
                const isSelected = selectedIds.includes(u.id);
                return (
                  <div
                    key={u.id}
                    onClick={() => toggleSelect(u.id)}
                    className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition select-none"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar src={u.avatar} name={u.name} size="md" />
                      <div>
                        <div className="text-sm font-semibold text-slate-900 dark:text-white">
                          {u.name}
                        </div>
                        {u.phone && (
                          <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1">
                            <Phone className="w-2.5 h-2.5" />
                            <span>{u.phone}</span>
                          </div>
                        )}
                        <div className="text-[11px] text-slate-400 truncate">
                          {u.about || 'Hey there! I am using Duo Chat.'}
                        </div>
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center border transition ${
                        isSelected
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : 'border-slate-300 dark:border-slate-600'
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
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-500/25 flex items-center gap-2 transition disabled:opacity-50"
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
