import React, { useState, useEffect } from 'react';
import { useChat } from '../../context/ChatContext';
import { userAPI } from '../../services/api';
import ConversationItem from './ConversationItem';
import Avatar from '../common/Avatar';
import { ConversationSkeleton } from '../common/LoadingSkeleton';
import { Phone, Users, MessageSquare, Archive, UserCheck, Loader2 } from 'lucide-react';

export default function ConversationList({ searchQuery, onOpenSearchUser }) {
  const { conversations, loadingConversations, startDirectChat } = useChat();
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'personal' | 'groups' | 'unread' | 'archived'
  const [globalUsers, setGlobalUsers] = useState([]);
  const [loadingGlobalUsers, setLoadingGlobalUsers] = useState(false);

  const totalUnread = conversations.reduce((acc, c) => acc + (Number(c.unread_count) || 0), 0);
  const totalArchived = conversations.filter(c => Boolean(c.is_archived)).length;

  // Filter conversations
  const filtered = conversations.filter(c => {
    // Archived filter
    if (activeTab === 'archived') {
      if (!c.is_archived) return false;
    } else {
      if (c.is_archived) return false;
    }

    // Tab filter
    if (activeTab === 'personal' && c.is_group) return false;
    if (activeTab === 'groups' && !c.is_group) return false;
    if (activeTab === 'unread' && (!c.unread_count || c.unread_count === 0)) return false;

    // Search query
    if (!searchQuery?.trim()) return true;

    const query = searchQuery.toLowerCase().replace(/[^0-9a-zA-Z]/g, '');
    const title = (c.is_group ? c.title : (c.other_user?.name || '')).toLowerCase();
    const phone = (c.other_user?.phone || '').replace(/[^0-9]/g, '');
    const rawQuery = searchQuery.toLowerCase();

    return (
      title.includes(rawQuery) ||
      phone.includes(query) ||
      (c.last_message?.content || '').toLowerCase().includes(rawQuery)
    );
  });

  // Global search for registered users when typing in search bar
  useEffect(() => {
    if (!searchQuery?.trim()) {
      setGlobalUsers([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoadingGlobalUsers(true);
        const res = await userAPI.search(searchQuery.trim());
        if (res.success && res.users) {
          // Filter out users who are already in the filtered conversation list to avoid duplicates
          const existingUserIds = new Set(
            conversations
              .filter(c => !c.is_group && c.other_user)
              .map(c => c.other_user.id)
          );
          setGlobalUsers(res.users.filter(u => !existingUserIds.has(u.id)));
        }
      } catch (err) {
        console.error('Failed to search global users:', err);
      } finally {
        setLoadingGlobalUsers(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery, conversations]);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-[#17212b]">
      {/* Telegram Folder Tabs */}
      <div className="flex items-center px-2 bg-white dark:bg-[#17212b] border-b border-[#e4e7ea] dark:border-[#242f3d] overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-3 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition ${
            activeTab === 'all'
              ? 'border-[#3390ec] dark:border-[#5288c1] text-[#3390ec] dark:text-[#5288c1]'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
          }`}
        >
          All
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('personal')}
          className={`px-3 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition ${
            activeTab === 'personal'
              ? 'border-[#3390ec] dark:border-[#5288c1] text-[#3390ec] dark:text-[#5288c1]'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
          }`}
        >
          Personal
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('groups')}
          className={`px-3 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition ${
            activeTab === 'groups'
              ? 'border-[#3390ec] dark:border-[#5288c1] text-[#3390ec] dark:text-[#5288c1]'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
          }`}
        >
          Groups
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('unread')}
          className={`px-3 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 flex items-center gap-1.5 transition ${
            activeTab === 'unread'
              ? 'border-[#3390ec] dark:border-[#5288c1] text-[#3390ec] dark:text-[#5288c1]'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
          }`}
        >
          <span>Unread</span>
          {totalUnread > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#3390ec] dark:bg-[#5288c1] text-white">
              {totalUnread}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('archived')}
          className={`px-3 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 flex items-center gap-1.5 transition ${
            activeTab === 'archived'
              ? 'border-[#3390ec] dark:border-[#5288c1] text-[#3390ec] dark:text-[#5288c1]'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
          }`}
        >
          <span>Archived</span>
          {totalArchived > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-zinc-400 text-white">
              {totalArchived}
            </span>
          )}
        </button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#e4e7ea]/40 dark:divide-[#242f3d]/40 pb-16">
        {loadingConversations ? (
          <>
            <ConversationSkeleton />
            <ConversationSkeleton />
            <ConversationSkeleton />
          </>
        ) : filtered.length === 0 && globalUsers.length === 0 ? (
          <div className="p-8 text-center text-zinc-400">
            <Phone className="w-8 h-8 mx-auto mb-2 text-[#3390ec]/40 dark:text-[#5288c1]/40" />
            <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              {searchQuery
                ? 'No matching conversations or users'
                : activeTab === 'archived'
                ? 'No archived chats'
                : activeTab === 'unread'
                ? 'No unread messages'
                : activeTab === 'groups'
                ? 'No groups yet'
                : 'No chats yet'}
            </p>
            <p className="text-[11px] mt-1 text-zinc-500 max-w-xs mx-auto">
              Tap the pencil button or type in the search bar to find any registered user!
            </p>
          </div>
        ) : (
          <>
            {/* Existing matching conversations */}
            {filtered.map(c => (
              <ConversationItem key={c.id} conversation={c} />
            ))}

            {/* Global Search Results (Registered users discovered by search) */}
            {searchQuery?.trim() && (
              <div className="bg-zinc-50/60 dark:bg-[#0e1621]/60 pt-2">
                <div className="px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center justify-between">
                  <span>Global Users & Contacts</span>
                  {loadingGlobalUsers && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                </div>

                {globalUsers.length === 0 && !loadingGlobalUsers && (
                  <div className="p-4 text-center text-xs text-zinc-400">
                    No new registered users found with "{searchQuery}".
                  </div>
                )}

                {globalUsers.map(u => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => startDirectChat(u.id)}
                    className="w-full px-3.5 py-2.5 flex items-center justify-between hover:bg-zinc-100 dark:hover:bg-[#202b36] transition text-left group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar src={u.avatar} name={u.name} size="md" />
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
                      </div>
                    </div>

                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#3390ec]/10 dark:bg-[#5288c1]/20 text-[#3390ec] dark:text-[#5288c1] group-hover:bg-[#3390ec] group-hover:text-white transition">
                      Start Chat
                    </span>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
