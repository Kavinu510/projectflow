'use client';

import React, { useState } from 'react';
import { type Project, type Task, type User } from '@/lib/mockData';
import StatusBadge from '@/components/ui/StatusBadge';
import ProgressBar from '@/components/ui/ProgressBar';
import AvatarStack from '@/components/ui/AvatarStack';
import { formatDate, isOverdue } from '@/lib/utils';
import {
  X,
  Pencil,
  Trash2,
  Calendar,
  Users,
  CheckSquare,
  Tag,
  Clock,
} from 'lucide-react';

interface ProjectDetailPanelProps {
  project: Project;
  tasks: Task[];
  users: User[];
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
  const userMap = Object.fromEntries(users.map((u) => [u.id, u]));
  const teamUsers = project.teamIds.map((id) => userMap[id]).filter(Boolean) as User[];

  const tasksByStatus = {
    'To-Do': tasks.filter((t) => t.status === 'To-Do'),
    'In Progress': tasks.filter((t) => t.status === 'In Progress'),
    Review: tasks.filter((t) => t.status === 'Review'),
    Done: tasks.filter((t) => t.status === 'Done'),
  };

  const TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'tasks', label: `Tasks (${tasks.length})` },
  ] as const;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-border shadow-card-hover h-full slide-up">
      {/* Panel header */}
      <div className="flex items-start justify-between p-5 border-b border-border">
        <div className="flex-1 min-w-0 pr-3">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="text-base font-semibold text-foreground leading-snug">
              {project.title}
            </h3>
            <StatusBadge variant={project.status} />
          </div>
          <p className="text-xs font-mono text-muted-foreground">{project.id}</p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={onEdit}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Edit project"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Delete project — this cannot be undone"
          >
            <Trash2 size={15} />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors ml-1"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border px-5">
        {TABS.map((tab) => (
          <button
            key={`detail-tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={`py-3 px-1 mr-5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-indigo-600 text-indigo-600' :'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-5 overflow-y-auto scrollbar-thin max-h-[calc(100vh-280px)]">
        {activeTab === 'overview' && (
          <div className="space-y-5">
            {/* Description */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                Description
              </p>
              <p className="text-sm text-foreground leading-relaxed">{project.description}</p>
            </div>

            {/* Progress */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Progress
                </p>
                <span className="text-sm font-bold text-foreground tabular-nums">
                  {project.progress}%
                </span>
              </div>
              <ProgressBar value={project.progress} size="md" showLabel={false} />
              <p className="text-xs text-muted-foreground mt-2">
                {project.completedTaskCount} of {project.taskCount} tasks completed
              </p>
            </div>

            {/* Meta grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted rounded-lg p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Calendar size={13} className="text-muted-foreground" />
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Due Date
                  </p>
                </div>
                <p
                  className={`text-sm font-semibold tabular-nums ${
                    isOverdue(project.dueDate) && project.status !== 'Completed'
                      ? 'text-red-600' :'text-foreground'
                  }`}
                >
                  {formatDate(project.dueDate)}
                </p>
              </div>

              <div className="bg-muted rounded-lg p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Clock size={13} className="text-muted-foreground" />
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Created
                  </p>
                </div>
                <p className="text-sm font-semibold text-foreground tabular-nums">
                  {formatDate(project.createdDate)}
                </p>
              </div>

              <div className="bg-muted rounded-lg p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <CheckSquare size={13} className="text-muted-foreground" />
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Tasks
                  </p>
                </div>
                <p className="text-sm font-semibold text-foreground tabular-nums">
                  {project.completedTaskCount}/{project.taskCount}
                </p>
              </div>

              <div className="bg-muted rounded-lg p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Users size={13} className="text-muted-foreground" />
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Team
                  </p>
                </div>
                <AvatarStack users={teamUsers} max={4} size="sm" />
              </div>
            </div>

            {/* Tags */}
            {project.tags.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5mb-2">
                  <Tag size={13} className="text-muted-foreground" />
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Tags
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {project.tags.map((tag) => (
                    <span
                      key={`detail-tag-${project.id}-${tag}`}
                      className="text-xs px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-full font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Team members */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                Team Members
              </p>
              <div className="space-y-2">
                {teamUsers.map((user) => (
                  <div key={`detail-team-${user.id}`} className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
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
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-4">
            {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
              <div key={`task-group-${status}`}>
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    {status}
                  </p>
                  <span className="text-xs font-semibold tabular-nums bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">
                    {statusTasks.length}
                  </span>
                </div>
                {statusTasks.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic pl-1">No tasks</p>
                ) : (
                  <div className="space-y-1.5">
                    {statusTasks.map((task) => {
                      const assignee = userMap[task.assigneeId];
                      const overdue = isOverdue(task.dueDate) && task.status !== 'Done';
                      return (
                        <div
                          key={`panel-task-${task.id}`}
                          className="flex items-start gap-3 p-3 bg-muted rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground leading-snug truncate">
                              {task.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <StatusBadge variant={task.priority} size="sm" showDot={false} />
                              <span
                                className={`text-xs tabular-nums ${
                                  overdue ? 'text-red-600 font-semibold' : 'text-muted-foreground'
                                }`}
                              >
                                {formatDate(task.dueDate)}
                              </span>
                            </div>
                          </div>
                          {assignee && (
                            <div
                              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 mt-0.5"
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