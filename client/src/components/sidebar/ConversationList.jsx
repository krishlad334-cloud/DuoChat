import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import ConversationItem from './ConversationItem';
import { ConversationSkeleton } from '../common/LoadingSkeleton';
import { Phone, Users, MessageSquare } from 'lucide-react';

export default function ConversationList({ searchQuery, onOpenSearchUser }) {
  const { conversations, loadingConversations } = useChat();
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'personal' | 'groups' | 'unread'

  const totalUnread = conversations.reduce((acc, c) => acc + (Number(c.unread_count) || 0), 0);

  const filtered = conversations.filter(c => {
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

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-[#17212b]">
      {/* Telegram Folder Tabs */}
      <div className="flex items-center px-2 bg-white dark:bg-[#17212b] border-b border-[#e4e7ea] dark:border-[#242f3d] overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-3.5 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition ${
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
          className={`px-3.5 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition ${
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
          className={`px-3.5 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition ${
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
          className={`px-3.5 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 flex items-center gap-1.5 transition ${
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
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#e4e7ea]/40 dark:divide-[#242f3d]/40 pb-16">
        {loadingConversations ? (
          <>
            <ConversationSkeleton />
            <ConversationSkeleton />
            <ConversationSkeleton />
          </>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-zinc-400">
            <Phone className="w-8 h-8 mx-auto mb-2 text-[#3390ec]/40 dark:text-[#5288c1]/40" />
            <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              {searchQuery
                ? 'No matching conversations'
                : activeTab === 'unread'
                ? 'No unread messages'
                : activeTab === 'groups'
                ? 'No groups yet'
                : 'No chats yet'}
            </p>
            <p className="text-[11px] mt-1 text-zinc-500 max-w-xs mx-auto">
              Tap the pencil button or search icon to find any contact by phone number!
            </p>
          </div>
        ) : (
          filtered.map(c => (
            <ConversationItem key={c.id} conversation={c} />
          ))
        )}
      </div>
    </div>
  );
}
