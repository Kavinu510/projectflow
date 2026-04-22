'use client';

import React from 'react';
import { type Project, type User, type TaskStatus, type TaskPriority } from '@/lib/mockData';
import { type TaskFilters } from '../page';
import { X } from 'lucide-react';

const ALL_STATUSES: TaskStatus[] = ['To-Do', 'In Progress', 'Review', 'Done'];
const ALL_PRIORITIES: TaskPriority[] = ['High', 'Medium', 'Low'];

interface TaskFilterPanelProps {
  filters: TaskFilters;
  onChange: (f: TaskFilters) => void;
  projects: Project[];
  users: User[];
  onClose: () => void;
}

export default function TaskFilterPanel({
  filters,
  onChange,
  projects,
  users,
  onClose,
}: TaskFilterPanelProps) {
  const toggle = <T extends string>(arr: T[], val: T): T[] =>
    arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];

  const clearAll = () =>
    onChange({ search: filters.search, projectIds: [], assigneeIds: [], priorities: [], statuses: [] });

  const hasActive =
    filters.projectIds.length + filters.assigneeIds.length + filters.priorities.length + filters.statuses.length > 0;

  return (
    <div className="bg-white dark:bg-gray-900 border border-border rounded-xl shadow-card p-5 slide-up">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Filter Tasks</h3>
        <div className="flex items-center gap-2">
          {hasActive && (
            <button
              onClick={clearAll}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
            >
              Clear all
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Status */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
            Status
          </p>
          <div className="flex flex-wrap gap-1.5">
            {ALL_STATUSES.map((s) => (
              <button
                key={`filter-status-${s}`}
                onClick={() => onChange({ ...filters, statuses: toggle(filters.statuses, s) })}
                className={`px-2.5 py-1 text-xs font-medium rounded-full border transition-all ${
                  filters.statuses.includes(s)
                    ? 'bg-indigo-600 text-white border-indigo-600' :'bg-white dark:bg-gray-800 text-foreground border-border hover:border-indigo-400'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Priority */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
            Priority
          </p>
          <div className="flex flex-wrap gap-1.5">
            {ALL_PRIORITIES.map((p) => (
              <button
                key={`filter-priority-${p}`}
                onClick={() => onChange({ ...filters, priorities: toggle(filters.priorities, p) })}
                className={`px-2.5 py-1 text-xs font-medium rounded-full border transition-all ${
                  filters.priorities.includes(p)
                    ? 'bg-indigo-600 text-white border-indigo-600' :'bg-white dark:bg-gray-800 text-foreground border-border hover:border-indigo-400'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Project */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
            Project
          </p>
          <div className="space-y-1 max-h-32 overflow-y-auto scrollbar-thin">
            {projects.map((proj) => (
              <label
                key={`filter-proj-${proj.id}`}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={filters.projectIds.includes(proj.id)}
                  onChange={() =>
                    onChange({ ...filters, projectIds: toggle(filters.projectIds, proj.id) })
                  }
                  className="w-3.5 h-3.5 rounded accent-indigo-600"
                />
                <span className="text-sm text-foreground group-hover:text-indigo-600 transition-colors truncate">
                  {proj.title}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Assignee */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
            Assignee
          </p>
          <div className="space-y-1.5">
            {users.map((user) => (
              <label
                key={`filter-user-${user.id}`}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={filters.assigneeIds.includes(user.id)}
                  onChange={() =>
                    onChange({ ...filters, assigneeIds: toggle(filters.assigneeIds, user.id) })
                  }
                  className="w-3.5 h-3.5 rounded accent-indigo-600"
                />
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
                  style={{ backgroundColor: user.color }}
                >
                  {user.initials}
                </div>
                <span className="text-sm text-foreground group-hover:text-indigo-600 transition-colors truncate">
                  {user.name}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}