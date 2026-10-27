import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import SidebarHeader from './SidebarHeader';
import ConversationList from './ConversationList';
import SearchUserModal from './SearchUserModal';
import GroupModal from '../chat/GroupModal';
import { MessageSquarePlus, Edit3 } from 'lucide-react';

export default function Sidebar() {
  const { isMobileChatOpen } = useChat();
  const [isSearchUserOpen, setIsSearchUserOpen] = useState(false);
  const [isNewGroupOpen, setIsNewGroupOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <>
      <div
        className={`w-full md:w-80 lg:w-[380px] flex flex-col h-full border-r border-[#e4e7ea] dark:border-[#242f3d] bg-white dark:bg-[#17212b] relative transition-all ${
          isMobileChatOpen ? 'hidden md:flex' : 'flex'
        }`}
      >
        <SidebarHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenSearchUser={() => setIsSearchUserOpen(true)}
          onOpenNewGroup={() => setIsNewGroupOpen(true)}
        />

        <ConversationList
          searchQuery={searchQuery}
          onOpenSearchUser={() => setIsSearchUserOpen(true)}
        />

        {/* Telegram Signature Floating Action Button (FAB) */}
        <button
          type="button"
          onClick={() => setIsSearchUserOpen(true)}
          className="absolute bottom-5 right-5 w-13 h-13 rounded-full bg-[#3390ec] dark:bg-[#5288c1] hover:bg-[#2b7dce] dark:hover:bg-[#4677aa] text-white shadow-xl shadow-[#3390ec]/30 flex items-center justify-center transition active:scale-95 z-30"
          title="New Chat by Phone Number"
        >
          <Edit3 className="w-6 h-6" />
        </button>
      </div>

      <SearchUserModal
        isOpen={isSearchUserOpen}
        onClose={() => setIsSearchUserOpen(false)}
      />

      <GroupModal
        isOpen={isNewGroupOpen}
        onClose={() => setIsNewGroupOpen(false)}
      />
    </>
  );
}
