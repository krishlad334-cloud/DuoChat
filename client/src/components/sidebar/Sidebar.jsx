import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import SidebarHeader from './SidebarHeader';
import ConversationList from './ConversationList';
import SearchUserModal from './SearchUserModal';
import GroupModal from '../chat/GroupModal';

export default function Sidebar() {
  const { isMobileChatOpen } = useChat();
  const [isSearchUserOpen, setIsSearchUserOpen] = useState(false);
  const [isNewGroupOpen, setIsNewGroupOpen] = useState(false);

  return (
    <>
      <div
        className={`w-full md:w-80 lg:w-96 flex flex-col h-full border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all ${
          isMobileChatOpen ? 'hidden md:flex' : 'flex'
        }`}
      >
        <SidebarHeader
          onOpenSearchUser={() => setIsSearchUserOpen(true)}
          onOpenNewGroup={() => setIsNewGroupOpen(true)}
        />
        <ConversationList />
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
