import React from 'react';
import type { User } from '@/lib/mockData';

interface AvatarStackProps {
  users: User[];
  max?: number;
  size?: 'sm' | 'md';
}

export default function AvatarStack({ users, max = 4, size = 'sm' }: AvatarStackProps) {
  const visible = users.slice(0, max);
  const overflow = users.length - max;
  const sizeClass = size === 'sm' ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-xs';
  const borderClass = 'ring-2 ring-white dark:ring-gray-900';

  return (
    <div className="flex items-center -space-x-1.5">
      {visible.map((user) => (
        <div
          key={`avatar-${user.id}`}
          className={`${sizeClass} ${borderClass} rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0`}
          style={{ backgroundColor: user.color }}
          title={user.name}
        >
          {user.initials}
        </div>
      ))}
      {overflow > 0 && (
        <div
          className={`${sizeClass} ${borderClass} rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-semibold flex-shrink-0`}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}