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
      <div className="bg-white dark:bg-[#111b21] w-full max-w-md rounded-2xl shadow-2xl border border-[#e9edef] dark:border-[#222d34] overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-[#008069] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            <h3 className="text-base font-semibold truncate">
              {conversation.title || 'Group Info'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-black/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-4 mt-4 p-2.5 text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 rounded-lg">
            {error}
          </div>
        )}

        <div className="p-4 border-b border-[#e9edef] dark:border-[#222d34] flex items-center justify-between bg-[#f0f2f5] dark:bg-[#202c33]">
          <div>
            <div className="text-sm font-semibold text-[#111b21] dark:text-[#e9edef]">
              {members.length} participants
            </div>
            <div className="text-xs text-[#8696a0]">
              Group created on {new Date(conversation.created_at).toLocaleDateString()}
            </div>
          </div>

          {isAdmin && !showAddMember && (
            <button
              onClick={() => setShowAddMember(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00a884] hover:bg-[#008069] text-white text-xs font-semibold rounded-lg transition"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Member</span>
            </button>
          )}
        </div>

        {/* Add Member Dropdown Panel */}
        {showAddMember && (
          <div className="p-3 bg-[#f0f2f5] dark:bg-[#202c33] border-b border-[#e9edef] dark:border-[#222d34] space-y-2">
            <label className="block text-xs font-medium text-[#111b21] dark:text-[#e9edef]">
              Select contact to add:
            </label>
            <div className="flex gap-2">
              <select
                value={selectedUserIdToAdd}
                onChange={(e) => setSelectedUserIdToAdd(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-white dark:bg-[#111b21] border border-transparent dark:border-[#222d34] rounded-lg text-xs text-[#111b21] dark:text-[#e9edef] focus:outline-none focus:ring-1 focus:ring-[#00a884]"
              >
                <option value="">Choose a contact...</option>
                {allUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} {u.phone ? `(${u.phone})` : ''}
                  </option>
                ))}
              </select>
              <button
                disabled={!selectedUserIdToAdd || loading}
                onClick={handleAddMember}
                className="px-3 py-1.5 bg-[#00a884] hover:bg-[#008069] text-white text-xs font-semibold rounded-lg transition disabled:opacity-50"
              >
                Add
              </button>
              <button
                onClick={() => setShowAddMember(false)}
                className="px-2 py-1.5 text-[#8696a0] hover:text-[#111b21] text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Member List */}
        <div className="flex-1 overflow-y-auto p-2 divide-y divide-[#e9edef]/60 dark:divide-[#222d34]/60">
          {members.map((m) => {
            const isGroupAdmin = conversation.creator_id === m.id || m.role === 'admin';
            const isMe = m.id === user?.id;

            return (
              <div key={m.id} className="py-2.5 px-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar src={m.avatar} name={m.name} size="md" />
                  <div>
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-[#111b21] dark:text-[#e9edef]">
                      <span>{m.name}</span>
                      {isMe && (
                        <span className="text-[10px] px-1.5 py-0.2 bg-[#f0f2f5] dark:bg-[#202c33] text-[#8696a0] rounded">
                          You
                        </span>
                      )}
                      {isGroupAdmin && (
                        <span className="flex items-center gap-0.5 text-[10px] px-1.5 py-0.2 bg-[#00a884]/15 text-[#00a884] dark:text-[#25d366] rounded font-semibold">
                          <ShieldCheck className="w-3 h-3" />
                          Group Admin
                        </span>
                      )}
                    </div>
                    {m.phone && (
                      <div className="text-xs text-[#00a884] dark:text-[#25d366] font-medium flex items-center gap-1">
                        <Phone className="w-2.5 h-2.5" />
                        <span>{m.phone}</span>
                      </div>
                    )}
                    <div className="text-[11px] text-[#8696a0] truncate">
                      {m.about || 'Hey there! I am using WhatsApp.'}
                    </div>
                  </div>
                </div>

                {isAdmin && !isMe && (
                  <button
                    disabled={loading}
                    onClick={() => handleRemoveMember(m.id)}
                    className="p-1.5 text-[#8696a0] hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition"
                    title="Remove from group"
                  >
                    <UserMinus className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Leave Group Action */}
        <div className="p-3 bg-[#f0f2f5] dark:bg-[#202c33] border-t border-[#e9edef] dark:border-[#222d34] flex justify-between items-center">
          <button
            onClick={handleLeaveGroup}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Exit group</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-[#54656f] dark:text-[#aebac1] hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
