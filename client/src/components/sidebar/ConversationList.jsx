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
    <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-[#111b21]">
      {/* WhatsApp Search Bar */}
      <div className="p-2.5 bg-white dark:bg-[#111b21] border-b border-[#e9edef] dark:border-[#222d34] flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#54656f] dark:text-[#aebac1]" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Search or start new chat"
            className="w-full pl-9 pr-7 py-1.5 bg-[#f0f2f5] dark:bg-[#202c33] border-0 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#00a884] text-[#111b21] dark:text-[#e9edef] placeholder-[#667781] dark:placeholder-[#8696a0] transition"
          />
          {filterQuery && (
            <button
              onClick={() => setFilterQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8696a0] hover:text-[#111b21]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Unread Filter Pill */}
        <button
          onClick={() => setOnlyUnread(!onlyUnread)}
          className={`p-1.5 rounded-full transition ${
            onlyUnread
              ? 'bg-[#00a884] text-white'
              : 'text-[#54656f] dark:text-[#aebac1] hover:bg-black/5 dark:hover:bg-white/5'
          }`}
          title={onlyUnread ? 'Show all chats' : 'Filter unread chats'}
        >
          <Filter className="w-4 h-4" />
        </button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#e9edef]/40 dark:divide-[#222d34]/40">
        {loadingConversations ? (
          <>
            <ConversationSkeleton />
            <ConversationSkeleton />
            <ConversationSkeleton />
          </>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-[#8696a0]">
            <Phone className="w-8 h-8 mx-auto mb-2 opacity-30 text-[#00a884]" />
            <p className="text-xs font-medium text-[#111b21] dark:text-[#e9edef]">
              {filterQuery
                ? 'No matching conversations'
                : onlyUnread
                ? 'No unread messages'
                : 'No chats yet'}
            </p>
            <p className="text-[11px] mt-1 text-[#8696a0]">
              Click the green chat icon above to search any phone number and chat!
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
