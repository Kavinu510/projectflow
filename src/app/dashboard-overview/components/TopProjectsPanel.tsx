'use client';

import React from 'react';
import Link from 'next/link';
import { PROJECTS, USERS } from '@/lib/mockData';
import { formatDate, isOverdue } from '@/lib/utils';
import ProgressBar from '@/components/ui/ProgressBar';
import StatusBadge from '@/components/ui/StatusBadge';
import AvatarStack from '@/components/ui/AvatarStack';
import { ArrowRight } from 'lucide-react';

// Backend integration point: replace with GET /api/projects?sort=dueDate&limit=4&status=Active

export default function TopProjectsPanel() {
  const topProjects = PROJECTS.filter((p) => p.status === 'Active')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 4);

  const userMap = Object.fromEntries(USERS.map((u) => [u.id, u]));

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-border shadow-card">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <h3 className="text-base font-semibold text-foreground">Upcoming Deadlines</h3>
        <Link
          href="/project-management"
          className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline flex items-center gap-1"
        >
          View all projects
          <ArrowRight size={12} />
        </Link>
      </div>

      <div className="divide-y divide-border">
        {topProjects.map((project) => {
          const teamUsers = project.teamIds
            .map((id) => userMap[id])
            .filter(Boolean) as typeof USERS;
          const dueDateOverdue = isOverdue(project.dueDate);

          return (
            <div
              key={`top-proj-${project.id}`}
              className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              {/* Project info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-sm font-semibold text-foreground truncate">
                    {project.title}
                  </span>
                  <StatusBadge variant={project.status} showDot={false} />
                </div>
                <ProgressBar value={project.progress} showLabel size="xs" />
              </div>

              {/* Task count */}
              <div className="hidden sm:block text-center flex-shrink-0 w-20">
                <p className="text-xs text-muted-foreground">Tasks</p>
                <p className="text-sm font-semibold text-foreground tabular-nums">
                  {project.completedTaskCount}/{project.taskCount}
                </p>
              </div>

              {/* Due date */}
              <div className="hidden md:block text-right flex-shrink-0 w-28">
                <p className="text-xs text-muted-foreground">Due</p>
                <p
                  className={`text-sm font-semibold tabular-nums ${
                    dueDateOverdue ? 'text-red-600' : 'text-foreground'
                  }`}
                >
                  {formatDate(project.dueDate)}
                </p>
              </div>

              {/* Team */}
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