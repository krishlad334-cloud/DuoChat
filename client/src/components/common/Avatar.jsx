import React, { useState } from 'react';
import { getInitials, getRandomColor } from '../../utils/formatters';

export default function Avatar({
  src,
  name = 'User',
  size = 'md',
  isOnline = false,
  showStatus = false,
  className = ''
}) {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg font-semibold',
  };

  const statusSizeClasses = {
    xs: 'w-1.5 h-1.5 bottom-0 right-0',
    sm: 'w-2 h-2 bottom-0 right-0 ring-1',
    md: 'w-2.5 h-2.5 bottom-0 right-0 ring-2',
    lg: 'w-3 h-3 bottom-0.5 right-0.5 ring-2',
    xl: 'w-4 h-4 bottom-1 right-1 ring-2',
  };

  const initials = getInitials(name);
  const bgColor = getRandomColor(name);

  return (
    <div className={`relative inline-flex flex-shrink-0 ${className}`}>
      {src && !imageError ? (
        <img
          src={src}
          alt={name}
          onError={() => setImageError(true)}
          className={`${sizeClasses[size]} rounded-full object-cover ring-1 ring-black/5 dark:ring-white/10`}
        />
      ) : (
        <div
          className={`${sizeClasses[size]} ${bgColor} rounded-full flex items-center justify-center font-medium text-white shadow-sm`}
        >
          {initials}
        </div>
      )}

      {showStatus && (
        <span
          className={`absolute rounded-full ring-white dark:ring-slate-900 ${
            statusSizeClasses[size]
          } ${isOnline ? 'bg-emerald-500' : 'bg-slate-400'}`}
          title={isOnline ? 'Online' : 'Offline'}
        />
      )}
    </div>
  );
}
