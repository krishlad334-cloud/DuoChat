import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import ConversationItem from './ConversationItem';
import { ConversationSkeleton } from '../common/LoadingSkeleton';
import { Search, X, MessageSquare, Filter, Phone } from 'lucide-react';

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
    <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-slate-900">
      {/* Search Bar */}
      <div className="p-3 border-b border-slate-100 dark:border-slate-800/80 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Search name or phone number..."
            className="w-full pl-9 pr-7 py-2 bg-slate-100 dark:bg-slate-800/90 border-0 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-slate-900 dark:text-slate-100 placeholder-slate-400 transition"
          />
          {filterQuery && (
            <button
              onClick={() => setFilterQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
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
              ? 'bg-indigo-600 text-white'
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title={onlyUnread ? 'Show all chats' : 'Filter unread chats'}
        >
          <Filter className="w-4 h-4" />
        </button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
        {loadingConversations ? (
          <>
            <ConversationSkeleton />
            <ConversationSkeleton />
            <ConversationSkeleton />
          </>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <Phone className="w-8 h-8 mx-auto mb-2 text-indigo-400/50" />
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {filterQuery
                ? 'No matching conversations'
                : onlyUnread
                ? 'No unread messages'
                : 'No chats yet'}
            </p>
            <p className="text-[11px] mt-1 text-slate-500 max-w-xs mx-auto">
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
