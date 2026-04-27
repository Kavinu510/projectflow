'use client';

import Link from 'next/link';
import React from 'react';
import { ArrowRight } from 'lucide-react';
import AvatarStack from '@/components/ui/AvatarStack';
import ProgressBar from '@/components/ui/ProgressBar';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatDate, isOverdue } from '@/lib/utils';
import { type Project, type UserProfile } from '@/lib/types';

export default function TopProjectsPanel({
  projects,
  members,
}: {
  projects: Project[];
  members: UserProfile[];
}) {
  const memberMap = Object.fromEntries(members.map((member) => [member.id, member]));

  return (
    <div className="rounded-xl border border-border bg-white shadow-card dark:bg-slate-900">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <h3 className="text-base font-semibold text-foreground">Upcoming Deadlines</h3>
        <Link
          href="/project-management"
          className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:underline"
        >
          View all projects
          <ArrowRight size={12} />
        </Link>
      </div>

      <div className="divide-y divide-border">
        {projects.map((project) => {
          const teamUsers = project.teamIds
            .map((teamId) => memberMap[teamId])
            .filter(Boolean) as UserProfile[];
          const overdue = isOverdue(project.dueDate) && project.status !== 'Completed';

          return (
            <div
              key={project.id}
              className="flex items-center gap-4 px-6 py-4 transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
            >
              <div className="min-w-0 flex-1">
                <div className="mb-1.5 flex items-center gap-2">
                  <span className="truncate text-sm font-semibold text-foreground">
                    {project.title}
                  </span>
                  <StatusBadge variant={project.status} showDot={false} />
                </div>
                <ProgressBar value={project.progress} showLabel size="xs" />
              </div>

              <div className="hidden w-20 flex-shrink-0 text-center sm:block">
                <p className="text-xs text-muted-foreground">Tasks</p>
                <p className="text-sm font-semibold text-foreground">
                  {project.completedTaskCount}/{project.taskCount}
                </p>
              </div>

              <div className="hidden w-28 flex-shrink-0 text-right md:block">
                <p className="text-xs text-muted-foreground">Due</p>
                <p
                  className={`text-sm font-semibold ${overdue ? 'text-red-600' : 'text-foreground'}`}
                >
                  {formatDate(project.dueDate)}
                </p>
              </div>

              <div className="flex-shrink-0">
                <AvatarStack users={teamUsers} max={3} size="sm" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
