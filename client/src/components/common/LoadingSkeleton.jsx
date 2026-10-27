import React from 'react';

export function ConversationSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 animate-pulse">
      <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700/60 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="flex justify-between items-center">
          <div className="h-4 bg-slate-200 dark:bg-slate-700/60 rounded w-28" />
          <div className="h-3 bg-slate-200 dark:bg-slate-700/60 rounded w-12" />
        </div>
        <div className="h-3 bg-slate-200 dark:bg-slate-700/60 rounded w-44" />
      </div>
    </div>
  );
}

export function MessageSkeleton() {
  return (
    <div className="space-y-4 p-4 animate-pulse">
      <div className="flex gap-2 max-w-[70%]">
        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700/60 flex-shrink-0" />
        <div className="space-y-2 flex-1">
          <div className="h-10 bg-slate-200 dark:bg-slate-700/60 rounded-2xl w-48" />
        </div>
      </div>
      <div className="flex justify-end">
        <div className="h-12 bg-indigo-200 dark:bg-indigo-950/60 rounded-2xl w-56" />
      </div>
      <div className="flex gap-2 max-w-[70%]">
        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700/60 flex-shrink-0" />
        <div className="space-y-2 flex-1">
          <div className="h-14 bg-slate-200 dark:bg-slate-700/60 rounded-2xl w-64" />
        </div>
      </div>
    </div>
  );
}
