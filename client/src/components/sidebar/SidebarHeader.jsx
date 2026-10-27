import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';
import ThemeToggle from '../common/ThemeToggle';
import {
  Menu,
  X,
  Users,
  UserPlus,
  Moon,
  Sun,
  LogOut,
  Phone,
  ShieldCheck,
  Search,
  MessageSquarePlus,
  Server
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import ServerSettingsModal from '../auth/ServerSettingsModal';

export default function SidebarHeader({
  onOpenSearchUser,
  onOpenNewGroup,
  searchQuery,
  onSearchChange
}) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isServerModalOpen, setIsServerModalOpen] = useState(false);

  return (
    <>
      {/* Telegram Web Top Bar */}
      <div className="h-14 px-3 bg-[#ffffff] dark:bg-[#17212b] border-b border-[#e4e7ea] dark:border-[#242f3d] flex items-center gap-2.5 z-20">
        {/* Telegram Hamburger Menu Icon */}
        <button
          type="button"
          onClick={() => setIsDrawerOpen(true)}
          className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-[#242f3d] rounded-full transition"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Telegram-style Search Input */}
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search name or phone..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#f4f4f5] dark:bg-[#242f3d]/60 border border-transparent focus:border-[#3390ec] dark:focus:border-[#5288c1] rounded-full text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none transition"
          />
        </div>

        {/* Direct New Chat Button */}
        <button
          type="button"
          onClick={onOpenSearchUser}
          className="p-2 text-[#3390ec] dark:text-[#5288c1] hover:bg-[#3390ec]/10 dark:hover:bg-[#5288c1]/10 rounded-full transition"
          title="New Chat by Phone"
        >
          <MessageSquarePlus className="w-5 h-5" />
        </button>
      </div>

      {/* Telegram Slide-out Left Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            onClick={() => setIsDrawerOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer Content */}
          <div className="relative w-72 sm:w-80 h-full bg-[#ffffff] dark:bg-[#17212b] shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-250">
            {/* Top User Profile Header (Telegram signature style) */}
            <div className="p-5 bg-gradient-to-br from-[#3390ec] to-[#5288c1] text-white relative">
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/10 text-white transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-3">
                <Avatar
                  src={user?.avatar}
                  name={user?.name || 'Me'}
                  size="lg"
                  showStatus={true}
                  isOnline={true}
                  className="ring-2 ring-white/30"
                />
              </div>

              <h3 className="font-bold text-base tracking-tight truncate">
                {user?.name}
              </h3>

              {user?.phone && (
                <p className="text-xs text-white/90 font-mono mt-0.5 flex items-center gap-1">
                  <Phone className="w-3 h-3 inline" />
                  <span>{user.phone}</span>
                </p>
              )}

              {user?.about && (
                <p className="text-[11px] text-white/75 mt-1 truncate">
                  {user.about}
                </p>
              )}
            </div>

            {/* Menu Options */}
            <div className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
              <button
                type="button"
                onClick={() => {
                  setIsDrawerOpen(false);
                  onOpenNewGroup();
                }}
                className="w-full px-3 py-2.5 rounded-xl flex items-center gap-3.5 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-[#242f3d] text-sm font-medium transition"
              >
                <Users className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
                <span>New Group</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsDrawerOpen(false);
                  onOpenSearchUser();
                }}
                className="w-full px-3 py-2.5 rounded-xl flex items-center gap-3.5 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-[#242f3d] text-sm font-medium transition"
              >
                <UserPlus className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
                <span>Contacts & Phone Search</span>
              </button>

              <div className="my-2 border-t border-zinc-200 dark:border-[#242f3d]" />

              {/* Dark/Light mode toggle */}
              <button
                type="button"
                onClick={toggleTheme}
                className="w-full px-3 py-2.5 rounded-xl flex items-center justify-between text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-[#242f3d] text-sm font-medium transition"
              >
                <span className="flex items-center gap-3.5">
                  {theme === 'dark' ? (
                    <Sun className="w-5 h-5 text-amber-400" />
                  ) : (
                    <Moon className="w-5 h-5 text-[#3390ec]" />
                  )}
                  <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-[#242f3d] text-zinc-600 dark:text-zinc-400 font-semibold uppercase">
                  {theme}
                </span>
              </button>

              <div className="my-2 border-t border-zinc-200 dark:border-[#242f3d]" />

              {/* Server Connection Setting */}
              <button
                type="button"
                onClick={() => {
                  setIsDrawerOpen(false);
                  setIsServerModalOpen(true);
                }}
                className="w-full px-3 py-2.5 rounded-xl flex items-center justify-between text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-[#242f3d] text-sm font-medium transition"
              >
                <span className="flex items-center gap-3.5">
                  <Server className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
                  <span>Server Connection</span>
                </span>
              </button>

              <div className="my-2 border-t border-zinc-200 dark:border-[#242f3d]" />

              <button
                type="button"
                onClick={logout}
                className="w-full px-3 py-2.5 rounded-xl flex items-center gap-3.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-sm font-medium transition"
              >
                <LogOut className="w-5 h-5" />
                <span>Log Out</span>
              </button>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-zinc-200 dark:border-[#242f3d] text-center text-xs text-zinc-400">
              <p className="font-semibold text-zinc-600 dark:text-zinc-300">Duo Chat Web</p>
              <p className="text-[11px] mt-0.5">Fast &bull; Private &bull; Permanent</p>
            </div>
          </div>
        </div>
      )}

      {/* Server Settings Modal */}
      <ServerSettingsModal
        isOpen={isServerModalOpen}
        onClose={() => setIsServerModalOpen(false)}
      />
    </>
  );
}
