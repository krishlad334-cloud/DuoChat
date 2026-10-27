import React from 'react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';
import ThemeToggle from '../common/ThemeToggle';
import { MessageSquarePlus, Users, LogOut, Phone } from 'lucide-react';

export default function SidebarHeader({ onOpenSearchUser, onOpenNewGroup }) {
  const { user, logout } = useAuth();

  return (
    <div className="h-16 px-4 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between z-10">
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
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
            {user?.name}
          </h2>
          {user?.phone ? (
            <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium truncate flex items-center gap-1">
              <Phone className="w-2.5 h-2.5 inline" />
              <span>{user.phone}</span>
            </p>
          ) : (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              @{user?.username}
            </p>
          )}
        </div>
      </div>

      {/* Action Icons */}
      <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
        <button
          onClick={onOpenNewGroup}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl transition"
          title="New Group"
        >
          <Users className="w-5 h-5" />
        </button>

        <button
          onClick={onOpenSearchUser}
          className="p-2 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-xl transition"
          title="Search phone number to start new chat"
        >
          <MessageSquarePlus className="w-5 h-5" />
        </button>

        <ThemeToggle />

        <button
          onClick={logout}
          className="p-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 rounded-xl transition"
          title="Log Out"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
