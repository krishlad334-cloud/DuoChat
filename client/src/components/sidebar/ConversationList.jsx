import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import ConversationItem from './ConversationItem';
import { ConversationSkeleton } from '../common/LoadingSkeleton';
import { Search, X, MessageSquareDashed } from 'lucide-react';

export default function ConversationList() {
  const { conversations, loadingConversations } = useChat();
  const [filterQuery, setFilterQuery] = useState('');

  const filtered = conversations.filter(c => {
    if (!filterQuery.trim()) return true;
    const query = filterQuery.toLowerCase();
    const title = c.is_group ? c.title : (c.other_user?.name || '');
    const username = c.other_user?.username || '';
    const lastMsgContent = c.last_message?.content || '';

    return (
      title.toLowerCase().includes(query) ||
      username.toLowerCase().includes(query) ||
      lastMsgContent.toLowerCase().includes(query)
    );
  });

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-slate-900">
      {/* Search Bar */}
      <div className="p-3 border-b border-slate-100 dark:border-slate-800">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-9 pr-8 py-2 bg-slate-100 dark:bg-slate-800/80 border-0 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100 placeholder-slate-400 transition"
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
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100/60 dark:divide-slate-800/40">
        {loadingConversations ? (
          <>
            <ConversationSkeleton />
            <ConversationSkeleton />
            <ConversationSkeleton />
            <ConversationSkeleton />
          </>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <MessageSquareDashed className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
            <p className="text-xs">
              {filterQuery ? 'No matching conversations' : 'No conversations yet'}
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
