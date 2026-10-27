import React from 'react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';
import ThemeToggle from '../common/ThemeToggle';
import { MessageSquarePlus, Users, LogOut, Phone } from 'lucide-react';

export default function SidebarHeader({ onOpenSearchUser, onOpenNewGroup }) {
  const { user, logout } = useAuth();

  return (
    <div className="h-16 px-4 bg-white dark:bg-[#121215] border-b border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between z-10">
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
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
            {user?.name}
          </h2>
          {user?.phone ? (
            <p className="text-[11px] text-violet-600 dark:text-violet-400 font-medium truncate flex items-center gap-1">
              <Phone className="w-2.5 h-2.5 inline" />
              <span>{user.phone}</span>
            </p>
          ) : (
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
              @{user?.username}
            </p>
          )}
        </div>
      </div>

      {/* Action Icons */}
      <div className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400">
        <button
          onClick={onOpenNewGroup}
          className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-xl transition"
          title="New Group"
        >
          <Users className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenSearchUser}
          className="p-2 hover:bg-violet-50 dark:hover:bg-violet-950/50 text-violet-600 dark:text-violet-400 rounded-xl transition"
          title="Search phone number to start new chat"
        >
          <MessageSquarePlus className="w-4 h-4" />
        </button>

        <ThemeToggle />

        <button
          onClick={logout}
          className="p-2 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-600 rounded-xl transition"
          title="Log Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
