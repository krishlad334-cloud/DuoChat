import React, { useState, useEffect } from 'react';
import { chatAPI, userAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import Avatar from '../common/Avatar';
import { Users, X, UserPlus, UserMinus, LogOut, ShieldCheck, Phone } from 'lucide-react';

export default function GroupInfoModal({ isOpen, onClose, conversation }) {
  const { user } = useAuth();
  const { fetchConversations, setActiveConversation } = useChat();

  const [members, setMembers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedUserIdToAdd, setSelectedUserIdToAdd] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen || !conversation) return;
    setMembers(conversation.members || []);
    setShowAddMember(false);
    setError('');

    async function loadContacts() {
      try {
        const res = await userAPI.getAll();
        if (res.success && res.users) {
          const currentMemberIds = new Set((conversation.members || []).map(m => m.id));
          setAllUsers(res.users.filter(u => !currentMemberIds.has(u.id)));
        }
      } catch (err) {
        console.error('Failed to load contacts for group info:', err);
      }
    }

    loadContacts();
  }, [isOpen, conversation]);

  if (!isOpen || !conversation) return null;

  const isAdmin = conversation.creator_id === user?.id;

  const handleAddMember = async () => {
    if (!selectedUserIdToAdd) return;
    try {
      setLoading(true);
      setError('');
      const res = await chatAPI.addMember(conversation.id, selectedUserIdToAdd);
      if (res.success && res.conversation) {
        setMembers(res.conversation.members || []);
        setActiveConversation(res.conversation);
        setShowAddMember(false);
        setSelectedUserIdToAdd('');
        fetchConversations();
      }
    } catch (err) {
      setError(err.message || 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (targetUserId) => {
    if (!confirm('Are you sure you want to remove this member?')) return;
    try {
      setLoading(true);
      setError('');
      const res = await chatAPI.removeMember(conversation.id, targetUserId);
      if (res.success && res.conversation) {
        setMembers(res.conversation.members || []);
        setActiveConversation(res.conversation);
        fetchConversations();
      }
    } catch (err) {
      setError(err.message || 'Failed to remove member');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveGroup = async () => {
    if (!confirm('Are you sure you want to leave this group?')) return;
    try {
      setLoading(true);
      await chatAPI.removeMember(conversation.id, user.id);
      await fetchConversations();
      setActiveConversation(null);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to leave group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#17212b] w-full max-w-md rounded-3xl shadow-2xl border border-zinc-200 dark:border-[#242f3d] overflow-hidden flex flex-col max-h-[85vh]">
        {/* Telegram Header */}
        <div className="bg-[#3390ec] dark:bg-[#5288c1] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Users className="w-5 h-5" />
            <h3 className="text-base font-bold truncate">
              {conversation.title || 'Group Info'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-4 mt-4 p-2.5 text-xs text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 rounded-xl">
            {error}
          </div>
        )}

        <div className="p-4 border-b border-zinc-200 dark:border-[#242f3d] flex items-center justify-between bg-zinc-50 dark:bg-[#0e1621]">
          <div>
            <div className="text-sm font-semibold text-zinc-900 dark:text-white">
              {members.length} members
            </div>
            <div className="text-xs text-zinc-400">
              Created on {new Date(conversation.created_at).toLocaleDateString()}
            </div>
          </div>

          {isAdmin && !showAddMember && (
            <button
              type="button"
              onClick={() => setShowAddMember(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#3390ec] dark:bg-[#5288c1] hover:bg-[#2b7dce] dark:hover:bg-[#4677aa] text-white text-xs font-semibold rounded-xl shadow-xs transition"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Member</span>
            </button>
          )}
        </div>

        {/* Add Member Dropdown Panel */}
        {showAddMember && (
          <div className="p-3 bg-zinc-50 dark:bg-[#0e1621] border-b border-zinc-200 dark:border-[#242f3d] space-y-2">
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Select user to add:
            </label>
            <div className="flex gap-2">
              <select
                value={selectedUserIdToAdd}
                onChange={(e) => setSelectedUserIdToAdd(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-white dark:bg-[#17212b] border border-zinc-200 dark:border-[#242f3d] rounded-lg text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#3390ec]"
              >
                <option value="">Choose a user...</option>
                {allUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} {u.phone ? `(${u.phone})` : ''}
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={!selectedUserIdToAdd || loading}
                onClick={handleAddMember}
                className="px-3 py-1.5 bg-[#3390ec] dark:bg-[#5288c1] text-white text-xs font-semibold rounded-lg transition disabled:opacity-50"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setShowAddMember(false)}
                className="px-2 py-1.5 text-zinc-400 hover:text-zinc-600 text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Member List */}
        <div className="flex-1 overflow-y-auto p-2 divide-y divide-zinc-100 dark:divide-[#242f3d]/60">
          {members.map((m) => {
            const isUserAdmin = conversation.creator_id === m.id;
            const isSelf = m.id === user?.id;

            return (
              <div
                key={m.id}
                className="p-2.5 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-[#202b36] rounded-xl transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar src={m.avatar} name={m.name} size="md" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
                        {m.name} {isSelf && '(You)'}
                      </span>
                      {isUserAdmin && (
                        <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 bg-amber-500/10 text-amber-500 rounded-full border border-amber-500/20">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Admin</span>
                        </span>
                      )}
                    </div>
                    {m.phone ? (
                      <div className="text-xs text-[#3390ec] dark:text-[#5288c1] font-mono">
                        {m.phone}
                      </div>
                    ) : (
                      <div className="text-xs text-zinc-400">@{m.username}</div>
                    )}
                  </div>
                </div>

                {isAdmin && !isSelf && (
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(m.id)}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition"
                    title="Remove member"
                  >
                    <UserMinus className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="p-3 bg-zinc-50 dark:bg-[#0e1621] border-t border-zinc-200 dark:border-[#242f3d] flex justify-between items-center">
          <button
            type="button"
            onClick={handleLeaveGroup}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Leave Group</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-[#242f3d] rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
