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
      setError('Please provide a group subject/name.');
      return;
    }

    if (selectedIds.length === 0) {
      setError('Please select at least one contact.');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#111b21] w-full max-w-md rounded-2xl shadow-2xl border border-[#e9edef] dark:border-[#222d34] overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-[#008069] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            <h3 className="text-base font-semibold">New Group</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-black/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleCreate} className="flex-1 flex flex-col overflow-hidden">
          <div className="p-4 space-y-3 border-b border-[#e9edef] dark:border-[#222d34] bg-[#f0f2f5] dark:bg-[#202c33]">
            {error && (
              <div className="p-2.5 text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#111b21] dark:text-[#e9edef] mb-1">
                Group Subject
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Type group subject..."
                className="w-full px-3 py-2 bg-white dark:bg-[#111b21] border border-transparent dark:border-[#222d34] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00a884] text-[#111b21] dark:text-[#e9edef] placeholder-[#8696a0]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111b21] dark:text-[#e9edef] mb-1">
                Add Participants ({selectedIds.length} selected)
              </label>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name or phone number..."
                className="w-full px-3 py-1.5 bg-white dark:bg-[#111b21] border border-transparent dark:border-[#222d34] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#00a884] text-[#111b21] dark:text-[#e9edef] placeholder-[#8696a0]"
              />
            </div>
          </div>

          {/* Member List */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#e9edef]/60 dark:divide-[#222d34]/60">
            {loading ? (
              <div className="flex items-center justify-center py-8 text-[#00a884]">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#8696a0]">
                No contacts available.
              </div>
            ) : (
              filteredUsers.map((u) => {
                const isSelected = selectedIds.includes(u.id);
                return (
                  <div
                    key={u.id}
                    onClick={() => toggleSelect(u.id)}
                    className="p-3 flex items-center justify-between hover:bg-[#f5f6f6] dark:hover:bg-[#202c33] cursor-pointer transition select-none"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar src={u.avatar} name={u.name} size="md" />
                      <div>
                        <div className="text-sm font-semibold text-[#111b21] dark:text-[#e9edef]">
                          {u.name}
                        </div>
                        {u.phone && (
                          <div className="text-xs text-[#00a884] dark:text-[#25d366] font-medium flex items-center gap-1">
                            <Phone className="w-2.5 h-2.5" />
                            <span>{u.phone}</span>
                          </div>
                        )}
                        <div className="text-[11px] text-[#8696a0] truncate">
                          {u.about || 'Hey there! I am using WhatsApp.'}
                        </div>
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center border transition ${
                        isSelected
                          ? 'bg-[#00a884] border-[#00a884] text-white'
                          : 'border-[#8696a0]'
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
          <div className="p-3 bg-[#f0f2f5] dark:bg-[#202c33] border-t border-[#e9edef] dark:border-[#222d34] flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#54656f] dark:text-[#aebac1] hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-[#00a884] hover:bg-[#008069] text-white text-xs font-semibold rounded-lg shadow-md flex items-center gap-2 transition disabled:opacity-50"
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
