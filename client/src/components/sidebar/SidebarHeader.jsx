import React from 'react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';
import ThemeToggle from '../common/ThemeToggle';
import { MessageSquarePlus, Users, LogOut } from 'lucide-react';

export default function SidebarHeader({ onOpenSearchUser, onOpenNewGroup }) {
  const { user, logout } = useAuth();

  return (
    <div className="h-16 px-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between z-10">
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
          <h2 className="text-sm font-bold text-slate-900 dark:text-white truncate">
            {user?.name}
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
            @{user?.username}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-0.5">
        <button
          onClick={onOpenNewGroup}
          className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
          title="Create New Group"
        >
          <Users className="w-5 h-5" />
        </button>

        <button
          onClick={onOpenSearchUser}
          className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
          title="New Chat / Search Users"
        >
          <MessageSquarePlus className="w-5 h-5" />
        </button>

        <ThemeToggle />

        <button
          onClick={logout}
          className="p-2 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition"
          title="Log Out"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
