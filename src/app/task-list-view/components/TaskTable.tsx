'use client';

import React, { useState } from 'react';
import {
  type Task,
  type Project,
  type WorkspaceUserOption,
  type TaskStatus,
  type TaskPriority,
} from '@/lib/types';
import StatusBadge from '@/components/ui/StatusBadge';
import ConfirmModal from '@/components/ui/ConfirmModal';
import EmptyState from '@/components/ui/EmptyState';
import { formatDate, isOverdue } from '@/lib/utils';
import { type TaskFilters } from './TaskListViewClient';
import {
  Search,
  ArrowUp,
  ArrowDown,
  ChevronsUpDown,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ListTodo,
  X,
} from 'lucide-react';

type SortField = 'title' | 'dueDate' | 'priority' | 'status' | 'createdAt';
type SortDir = 'asc' | 'desc';

const PRIORITY_ORDER: Record<TaskPriority, number> = { High: 0, Medium: 1, Low: 2 };
const STATUS_ORDER: Record<TaskStatus, number> = {
  'In Progress': 0,
  Review: 1,
  'To-Do': 2,
  Done: 3,
};

const STATUS_OPTIONS: TaskStatus[] = ['To-Do', 'In Progress', 'Review', 'Done'];
const PAGE_SIZE_OPTIONS = [10, 20, 50];

interface TaskTableProps {
  tasks: Task[];
  projects: Project[];
  users: WorkspaceUserOption[];
  selectedIds: Set<string>;
  onSelectChange: (ids: Set<string>) => void;
  onEdit: (t: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onBulkDelete: () => void;
  onBulkStatusChange: (status: TaskStatus) => void;
  filters: TaskFilters;
  onSearchChange: (s: string) => void;
}

export default function TaskTable({
  tasks,
  projects,
  users,
  selectedIds,
  onSelectChange,
  onEdit,
  onDelete,
  onStatusChange,
  onBulkDelete,
  onBulkStatusChange,
  filters,
  onSearchChange,
}: TaskTableProps) {
  const [sortField, setSortField] = useState<SortField>('dueDate');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [statusMenuTask, setStatusMenuTask] = useState<string | null>(null);

  const projectMap = Object.fromEntries(projects.map((p) => [p.id, p]));
  const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

  const sorted = [...tasks].sort((a, b) => {
    let cmp = 0;
    if (sortField === 'title') cmp = a.title.localeCompare(b.title);
    else if (sortField === 'dueDate')
      cmp = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    else if (sortField === 'priority')
      cmp = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    else if (sortField === 'status') cmp = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
    else if (sortField === 'createdAt')
      cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
    setPage(1);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === paginated.length) {
      onSelectChange(new Set());
    } else {
      onSelectChange(new Set(paginated.map((t) => t.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelectChange(next);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field)
      return <ChevronsUpDown size={13} className="text-muted-foreground/50" />;
    return sortDir === 'asc' ? (
      <ArrowUp size={13} className="text-indigo-600" />
    ) : (
      <ArrowDown size={13} className="text-indigo-600" />
    );
  };

  const pageNumbers: number[] = [];
  for (let i = Math.max(1, page - 2); i <= Math.min(totalPages, page + 2); i++) {
    pageNumbers.push(i);
  }

  if (tasks.length === 0) {
    return (
      <EmptyState
        icon={<ListTodo size={24} />}
        title="No tasks found"
        description="No tasks match your current search or filter criteria. Try adjusting your filters or create a new task."
      />
    );
  }

  return (
    <>
      {/* Search bar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder="Search tasks by title or description…"
            value={filters.search}
            onChange={(e) => {
              onSearchChange(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-gray-900 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
          />
          {filters.search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X size={13} />
            </button>
          )}
        </div>
        <p className="text-sm text-muted-foreground tabular-nums">
          {sorted.length} result{sorted.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-border shadow-card overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="border-b border-border bg-slate-50 dark:bg-slate-800/50">
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={paginated.length > 0 && selectedIds.size === paginated.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded accent-indigo-600"
                    aria-label="Select all"
                  />
                </th>
                <th className="text-left px-4 py-3">
                  <button
                    onClick={() => handleSort('title')}
                    className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Task
                    <SortIcon field="title" />
                  </button>
                </th>
                <th className="text-left px-4 py-3 hidden md:table-cell">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Project
                  </span>
                </th>
                <th className="text-left px-4 py-3 hidden sm:table-cell">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Assignee
                  </span>
                </th>
                <th className="text-left px-4 py-3">
                  <button
                    onClick={() => handleSort('status')}
                    className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Status
                    <SortIcon field="status" />
                  </button>
                </th>
                <th className="text-left px-4 py-3">
                  <button
                    onClick={() => handleSort('priority')}
                    className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Priority
                    <SortIcon field="priority" />
                  </button>
                </th>
                <th className="text-left px-4 py-3 hidden lg:table-cell">
                  <button
                    onClick={() => handleSort('dueDate')}
                    className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Due Date
                    <SortIcon field="dueDate" />
                  </button>
                </th>
                <th className="text-left px-4 py-3 hidden xl:table-cell">
                  <button
                    onClick={() => handleSort('createdAt')}
                    className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Created
                    <SortIcon field="createdAt" />
                  </button>
                </th>
                <th className="text-right px-4 py-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Actions
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginated.map((task) => {
                const project = projectMap[task.projectId];
                const assignee = task.assigneeId ? userMap[task.assigneeId] : null;
                const overdue = isOverdue(task.dueDate) && task.status !== 'Done';
                const isSelected = selectedIds.has(task.id);
                const statusMenuOpen = statusMenuTask === task.id;

                return (
                  <tr
                    key={`task-row-${task.id}`}
                    className={`group hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
                      isSelected ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="px-4 py-3.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(task.id)}
                        className="w-4 h-4 rounded accent-indigo-600"
                        aria-label={`Select ${task.title}`}
                      />
                    </td>

                    {/* Title */}
                    <td className="px-4 py-3.5 max-w-[220px]">
                      <p className="font-semibold text-foreground truncate">{task.title}</p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5 font-mono">
                        {task.id}
                      </p>
                    </td>

                    {/* Project */}
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      {project ? (
                        <span className="text-xs font-medium px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-md truncate max-w-[120px] inline-block">
                          {project.title}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>

                    {/* Assignee */}
                    <td className="px-4 py-3.5 hidden sm:table-cell">
                      {assignee ? (
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
                            style={{ backgroundColor: assignee.color }}
                            title={assignee.name}
                          >
                            {assignee.initials}
                          </div>
                          <span className="text-sm text-foreground truncate max-w-[100px]">
                            {assignee.name.split(' ')[0]}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Unassigned</span>
                      )}
                    </td>

                    {/* Status — inline changeable */}
                    <td className="px-4 py-3.5">
                      <div className="relative">
                        <button
                          onClick={() => setStatusMenuTask(statusMenuOpen ? null : task.id)}
                          className="cursor-pointer hover:opacity-80 transition-opacity"
                        >
                          <StatusBadge variant={task.status} size="sm" />
                        </button>
                        {statusMenuOpen && (
                          <div
                            className="absolute left-0 top-7 z-20 w-40 bg-white dark:bg-gray-800 border border-border rounded-lg shadow-card-hover py-1 scale-in"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <button
                                key={`status-opt-${task.id}-${s}`}
                                onClick={() => {
                                  onStatusChange(task.id, s);
                                  setStatusMenuTask(null);
                                }}
                                className={`flex items-center gap-2 w-full px-3 py-2 text-xs font-medium hover:bg-muted transition-colors ${
                                  task.status === s ? 'text-indigo-600' : 'text-foreground'
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                    s === 'Done'
                                      ? 'bg-emerald-500'
                                      : s === 'In Progress'
                                        ? 'bg-blue-500'
                                        : s === 'Review'
                                          ? 'bg-amber-500'
                                          : 'bg-slate-400'
                                  }`}
                                />
                                {s}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Priority */}
                    <td className="px-4 py-3.5">
                      <StatusBadge variant={task.priority} size="sm" showDot={false} />
                    </td>

                    {/* Due date */}
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <span
                        className={`text-sm tabular-nums font-medium ${
                          overdue ? 'text-red-600' : 'text-foreground'
                        }`}
                      >
                        {formatDate(task.dueDate)}
                        {overdue && (
                          <span className="ml-1.5 text-xs text-red-500 font-semibold">Overdue</span>
                        )}
                      </span>
                    </td>

                    {/* Created date */}
                    <td className="px-4 py-3.5 hidden xl:table-cell">
                      <span className="text-sm text-muted-foreground tabular-nums">
                        {formatDate(task.createdAt)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onEdit(task)}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors"
                          title="Edit task"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(task)}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                          title="Delete task — this cannot be undone"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3.5 border-t border-border bg-slate-50 dark:bg-slate-800/30">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="text-xs bg-white dark:bg-gray-800 border border-input rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {PAGE_SIZE_OPTIONS.map((n) => (
                <option key={`page-size-${n}`} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <span className="text-xs text-muted-foreground tabular-nums">
              {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, sorted.length)} of{' '}
              {sorted.length}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={15} />
            </button>
            {pageNumbers.map((n) => (
              <button
                key={`page-btn-${n}`}
                onClick={() => setPage(n)}
                className={`w-7 h-7 text-xs font-medium rounded-md transition-colors tabular-nums ${
                  page === n
                    ? 'bg-indigo-600 text-white'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 slide-up">
          <div className="flex items-center gap-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl px-5 py-3 shadow-modal">
            <span className="text-sm font-semibold tabular-nums">{selectedIds.size} selected</span>
            <div className="w-px h-5 bg-gray-700 dark:bg-gray-300" />
            {STATUS_OPTIONS.map((s) => (
              <button
                key={`bulk-status-${s}`}
                onClick={() => onBulkStatusChange(s)}
                className="text-xs font-medium px-2.5 py-1.5 rounded-lg bg-gray-800 dark:bg-gray-100 hover:bg-gray-700 dark:hover:bg-gray-200 transition-colors whitespace-nowrap"
              >
                Move to {s}
              </button>
            ))}
            <div className="w-px h-5 bg-gray-700 dark:bg-gray-300" />
            <button
              onClick={onBulkDelete}
              className="text-xs font-medium px-2.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
            >
              Delete
            </button>
            <button
              onClick={() => onSelectChange(new Set())}
              className="p-1 rounded-md text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-900 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Click outside status menu */}
      {statusMenuTask && (
        <div className="fixed inset-0 z-10" onClick={() => setStatusMenuTask(null)} />
      )}

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) onDelete(deleteTarget.id);
          setDeleteTarget(null);
        }}
        title="Delete Task"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? This cannot be undone.`}
        confirmLabel="Delete Task"
      />
    </>
  );
}
