'use client';

import React from 'react';
import { ACTIVITY_EVENTS, USERS } from '@/lib/mockData';
import { formatRelativeTime } from '@/lib/utils';
import { CheckCircle2, PlayCircle, Eye, PlusCircle, ArrowRight, RefreshCw } from 'lucide-react';

// Backend integration point: replace with GET /api/activity?limit=8&sort=desc

const ACTION_ICONS: Record<string, React.ReactNode> = {
  moved: <ArrowRight size={13} className="text-indigo-500" />,
  started: <PlayCircle size={13} className="text-blue-500" />,
  'submitted for review': <Eye size={13} className="text-amber-500" />,
  'created project': <PlusCircle size={13} className="text-teal-500" />,
  completed: <CheckCircle2 size={13} className="text-emerald-500" />,
  updated: <RefreshCw size={13} className="text-slate-500" />,
};

const ACTION_LABELS: Record<string, string> = {
  moved: 'moved to Done',
  started: 'started working on',
  'submitted for review': 'submitted for review',
  'created project': 'created',
  completed: 'completed',
  updated: 'updated',
};

export default function ActivityFeed() {
  const userMap = Object.fromEntries(USERS.map((u) => [u.id, u]));

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-border shadow-card h-full">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <h3 className="text-base font-semibold text-foreground">Activity Feed</h3>
        <span className="text-xs text-muted-foreground">Today</span>
      </div>

      <div className="divide-y divide-border">
        {ACTIVITY_EVENTS.map((event) => {
          const user = userMap[event.userId];
          if (!user) return null;
          const icon = ACTION_ICONS[event.action] ?? <RefreshCw size={13} className="text-slate-400" />;
          const label = ACTION_LABELS[event.action] ?? event.action;

          return (
            <div
              key={`activity-${event.id}`}
              className="flex gap-3 px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              {/* Avatar */}
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 mt-0.5"
                style={{ backgroundColor: user.color }}
                title={user.name}
              >
                {user.initials}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground leading-snug">
                  <span className="font-semibold">{user.name.split(' ')[0]}</span>{' '}
                  <span className="text-muted-foreground">{label}</span>{' '}
                  <span className="font-medium text-foreground truncate">
                    &ldquo;{event.target}&rdquo;
                  </span>
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-700">
                    {icon}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatRelativeTime(event.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="px-5 py-3 border-t border-border">
        <button className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
          View all activity →
        </button>
      </div>
    </div>
  );
}