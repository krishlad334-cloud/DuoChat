import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import ConversationItem from './ConversationItem';
import { ConversationSkeleton } from '../common/LoadingSkeleton';
import { Search, X, Filter, Phone } from 'lucide-react';

export default function ConversationList() {
  const { conversations, loadingConversations } = useChat();
  const [filterQuery, setFilterQuery] = useState('');
  const [onlyUnread, setOnlyUnread] = useState(false);

  const filtered = conversations.filter(c => {
    if (onlyUnread && (!c.unread_count || c.unread_count === 0)) return false;
    if (!filterQuery.trim()) return true;

    const query = filterQuery.toLowerCase().replace(/[^0-9a-zA-Z]/g, '');
    const title = (c.is_group ? c.title : (c.other_user?.name || '')).toLowerCase();
    const phone = (c.other_user?.phone || '').replace(/[^0-9]/g, '');
    const rawQuery = filterQuery.toLowerCase();

    return (
      title.includes(rawQuery) ||
      phone.includes(query) ||
      (c.last_message?.content || '').toLowerCase().includes(rawQuery)
    );
  });

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-[#0e0e11]">
      {/* Minimalist Search Bar */}
      <div className="p-3 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Search name or phone number..."
            className="w-full pl-9 pr-7 py-2 bg-zinc-100 dark:bg-[#18181b] border-0 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 transition"
          />
          {filterQuery && (
            <button
              onClick={() => setFilterQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Unread Filter Button */}
        <button
          onClick={() => setOnlyUnread(!onlyUnread)}
          className={`p-2 rounded-xl transition ${
            onlyUnread
              ? 'bg-violet-600 text-white'
              : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
          title={onlyUnread ? 'Show all chats' : 'Filter unread chats'}
        >
          <Filter className="w-4 h-4" />
        </button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/50">
        {loadingConversations ? (
          <>
            <ConversationSkeleton />
            <ConversationSkeleton />
            <ConversationSkeleton />
          </>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-zinc-400">
            <Phone className="w-8 h-8 mx-auto mb-2 text-violet-500/40" />
            <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              {filterQuery
                ? 'No matching conversations'
                : onlyUnread
                ? 'No unread messages'
                : 'No chats yet'}
            </p>
            <p className="text-[11px] mt-1 text-zinc-500 max-w-xs mx-auto">
              Click the message icon above to search any user by phone number and start chatting!
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
