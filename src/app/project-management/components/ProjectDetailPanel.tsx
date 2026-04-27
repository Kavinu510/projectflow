'use client';

import React, { useState } from 'react';
import { Calendar, CheckSquare, Clock, Pencil, Tag, Trash2, Users, X } from 'lucide-react';
import AvatarStack from '@/components/ui/AvatarStack';
import ProgressBar from '@/components/ui/ProgressBar';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatDate, isOverdue } from '@/lib/utils';
import { type Project, type Task, type WorkspaceUserOption } from '@/lib/types';

interface ProjectDetailPanelProps {
  project: Project;
  tasks: Task[];
  users: WorkspaceUserOption[];
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function ProjectDetailPanel({
  project,
  tasks,
  users,
  onClose,
  onEdit,
  onDelete,
}: ProjectDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks'>('overview');
  const userMap = Object.fromEntries(users.map((user) => [user.id, user]));
  const teamUsers = project.teamIds
    .map((id) => userMap[id])
    .filter(Boolean) as WorkspaceUserOption[];

  const tasksByStatus = {
    'To-Do': tasks.filter((task) => task.status === 'To-Do'),
    'In Progress': tasks.filter((task) => task.status === 'In Progress'),
    Review: tasks.filter((task) => task.status === 'Review'),
    Done: tasks.filter((task) => task.status === 'Done'),
  };

  return (
    <div className="h-full rounded-xl border border-border bg-white shadow-card-hover dark:bg-slate-900">
      <div className="flex items-start justify-between border-b border-border p-5">
        <div className="min-w-0 flex-1 pr-3">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-foreground">{project.title}</h3>
            <StatusBadge variant={project.status} />
          </div>
          <p className="font-mono text-xs text-muted-foreground">{project.id}</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onEdit}
            className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <Pencil size={15} />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 size={15} />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="ml-1 rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      <div className="flex border-b border-border px-5">
        {(['overview', 'tasks'] as const).map((tab) => (
          <button
            type="button"
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`mr-5 border-b-2 px-1 py-3 text-sm font-medium transition ${
              activeTab === tab
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'overview' ? 'Overview' : `Tasks (${tasks.length})`}
          </button>
        ))}
      </div>

      <div className="scrollbar-thin max-h-[calc(100vh-280px)] overflow-y-auto p-5">
        {activeTab === 'overview' ? (
          <div className="space-y-5">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Description
              </p>
              <p className="text-sm leading-relaxed text-foreground">{project.description}</p>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Progress
                </p>
                <span className="text-sm font-bold text-foreground">{project.progress}%</span>
              </div>
              <ProgressBar value={project.progress} size="md" showLabel={false} />
              <p className="mt-2 text-xs text-muted-foreground">
                {project.completedTaskCount} of {project.taskCount} tasks completed
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <InfoCard icon={<Calendar size={13} />} label="Due Date">
                <p
                  className={`text-sm font-semibold ${
                    isOverdue(project.dueDate) && project.status !== 'Completed'
                      ? 'text-red-600'
                      : 'text-foreground'
                  }`}
                >
                  {formatDate(project.dueDate)}
                </p>
              </InfoCard>
              <InfoCard icon={<Clock size={13} />} label="Created">
                <p className="text-sm font-semibold text-foreground">
                  {formatDate(project.createdAt)}
                </p>
              </InfoCard>
              <InfoCard icon={<CheckSquare size={13} />} label="Tasks">
                <p className="text-sm font-semibold text-foreground">
                  {project.completedTaskCount}/{project.taskCount}
                </p>
              </InfoCard>
              <InfoCard icon={<Users size={13} />} label="Team">
                <AvatarStack users={teamUsers} max={4} size="sm" />
              </InfoCard>
            </div>

            {project.tags.length > 0 && (
              <div>
                <div className="mb-2 flex items-center gap-1.5">
                  <Tag size={13} className="text-muted-foreground" />
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Tags
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {project.tags.map((tag) => (
                    <span
                      key={`${project.id}-${tag}`}
                      className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Team Members
              </p>
              <div className="space-y-2">
                {teamUsers.map((user) => (
                  <div key={user.id} className="flex items-center gap-3">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white"
                      style={{ backgroundColor: user.color }}
                    >
                      {user.initials}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
              <div key={status}>
                <div className="mb-2 flex items-center gap-2">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    {status}
                  </p>
                  <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs font-semibold text-muted-foreground">
                    {statusTasks.length}
                  </span>
                </div>
                {statusTasks.length === 0 ? (
                  <p className="pl-1 text-xs italic text-muted-foreground">No tasks</p>
                ) : (
                  <div className="space-y-1.5">
                    {statusTasks.map((task) => {
                      const assignee = task.assigneeId ? userMap[task.assigneeId] : null;
                      const overdue = isOverdue(task.dueDate) && task.status !== 'Done';

                      return (
                        <div
                          key={task.id}
                          className="flex items-start gap-3 rounded-lg bg-muted p-3 transition hover:bg-slate-100 dark:hover:bg-slate-700"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-foreground">
                              {task.title}
                            </p>
                            <div className="mt-1 flex flex-wrap items-center gap-2">
                              <StatusBadge variant={task.priority} size="sm" showDot={false} />
                              <span
                                className={`text-xs ${
                                  overdue ? 'font-semibold text-red-600' : 'text-muted-foreground'
                                }`}
                              >
                                {formatDate(task.dueDate)}
                              </span>
                            </div>
                          </div>
                          {assignee && (
                            <div
                              className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold text-white"
                              style={{ backgroundColor: assignee.color }}
                              title={assignee.name}
                            >
                              {assignee.initials}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function InfoCard({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg bg-muted p-3">
      <div className="mb-1 flex items-center gap-1.5">
        <span className="text-muted-foreground">{icon}</span>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </p>
      </div>
      {children}
    </div>
  );
}
