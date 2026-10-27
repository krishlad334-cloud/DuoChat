import React from 'react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';
import ThemeToggle from '../common/ThemeToggle';
import { MessageSquarePlus, Users, LogOut, Phone } from 'lucide-react';

export default function SidebarHeader({ onOpenSearchUser, onOpenNewGroup }) {
  const { user, logout } = useAuth();

  return (
    <div className="h-16 px-4 bg-[#f0f2f5] dark:bg-[#202c33] border-b border-[#e9edef] dark:border-[#222d34] flex items-center justify-between z-10">
      {/* Current User Info */}
      <div className="flex items-center gap-3 min-w-0">
        <Avatar
          src={user?.avatar}
          name={user?.name || 'Me'}
          size="md"
          showStatus={true}
          isOnline={true}
        />
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-[#111b21] dark:text-[#e9edef] truncate">
            {user?.name}
          </h2>
          {user?.phone ? (
            <p className="text-[11px] text-[#00a884] dark:text-[#25d366] font-medium truncate flex items-center gap-1">
              <Phone className="w-2.5 h-2.5 inline" />
              <span>{user.phone}</span>
            </p>
          ) : (
            <p className="text-[11px] text-[#667781] dark:text-[#8696a0] truncate">
              @{user?.username}
            </p>
          )}
        </div>
      </div>

      {/* Action Icons */}
      <div className="flex items-center gap-1 text-[#54656f] dark:text-[#aebac1]">
        <button
          onClick={onOpenNewGroup}
          className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition"
          title="New Group"
        >
          <Users className="w-5 h-5" />
        </button>

        <button
          onClick={onOpenSearchUser}
          className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition text-[#00a884] dark:text-[#25d366]"
          title="Search phone number to start new chat"
        >
          <MessageSquarePlus className="w-5 h-5" />
        </button>

        <ThemeToggle />

        <button
          onClick={logout}
          className="p-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 rounded-full transition"
          title="Log Out"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
