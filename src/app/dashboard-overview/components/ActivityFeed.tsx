'use client';

import React from 'react';
import { ArrowRight, CheckCircle2, Eye, PlayCircle, PlusCircle, RefreshCw } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';
import { type ActivityLog, type UserProfile } from '@/lib/types';

const actionIcons: Record<string, React.ReactNode> = {
  moved: <ArrowRight size={13} className="text-indigo-500" />,
  started: <PlayCircle size={13} className="text-blue-500" />,
  'submitted for review': <Eye size={13} className="text-amber-500" />,
  'created project': <PlusCircle size={13} className="text-teal-500" />,
  completed: <CheckCircle2 size={13} className="text-emerald-500" />,
  updated: <RefreshCw size={13} className="text-slate-500" />,
};

const actionLabels: Record<string, string> = {
  moved: 'moved',
  started: 'started',
  'submitted for review': 'submitted for review',
  'created project': 'created',
  completed: 'completed',
  updated: 'updated',
  invited: 'invited',
  deleted: 'deleted',
  'updated status': 'updated',
  created: 'created',
};

export default function ActivityFeed({
  activity,
  members,
}: {
  activity: ActivityLog[];
  members: UserProfile[];
}) {
  const memberMap = Object.fromEntries(members.map((member) => [member.id, member]));

  return (
    <div className="h-full rounded-xl border border-border bg-white shadow-card dark:bg-slate-900">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h3 className="text-base font-semibold text-foreground">Activity Feed</h3>
        <span className="text-xs text-muted-foreground">Live workspace history</span>
      </div>

      <div className="divide-y divide-border">
        {activity.map((event) => {
          const member = event.actorId ? memberMap[event.actorId] : null;
          const icon = actionIcons[event.action] ?? (
            <RefreshCw size={13} className="text-slate-400" />
          );
          const label = actionLabels[event.action] ?? event.action;

          return (
            <div
              key={event.id}
              className="flex gap-3 px-5 py-3.5 transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
            >
              <div
                className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                style={{ backgroundColor: member?.color ?? '#64748B' }}
                title={member?.fullName ?? 'Workspace event'}
              >
                {member?.initials ?? 'FF'}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm leading-snug text-foreground">
                  <span className="font-semibold">
                    {member?.fullName.split(' ')[0] ?? 'FernFlow'}
                  </span>{' '}
                  <span className="text-muted-foreground">{label}</span>{' '}
                  <span className="font-medium text-foreground">
                    &ldquo;{event.targetName}&rdquo;
                  </span>
                </p>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700">
                    {icon}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatRelativeTime(event.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
