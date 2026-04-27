'use client';

import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle,
  FolderKanban,
  MoreHorizontal,
  PauseCircle,
  Pencil,
  PlayCircle,
  Trash2,
} from 'lucide-react';
import AvatarStack from '@/components/ui/AvatarStack';
import ConfirmModal from '@/components/ui/ConfirmModal';
import EmptyState from '@/components/ui/EmptyState';
import ProgressBar from '@/components/ui/ProgressBar';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatDate, isOverdue } from '@/lib/utils';
import { type Project, type ProjectStatus, type WorkspaceUserOption } from '@/lib/types';

interface ProjectGridProps {
  projects: Project[];
  onSelect: (project: Project) => void;
  selectedId?: string;
  onEdit: (project: Project) => void;
  onDelete: (projectId: string) => void;
  onStatusChange: (projectId: string, status: ProjectStatus) => void;
  viewMode: 'grid' | 'list';
  users: WorkspaceUserOption[];
}

const statusTransitions: Record<
  ProjectStatus,
  Array<{ label: string; icon: React.ReactNode; value: ProjectStatus }>
> = {
  Active: [
    { label: 'Put On Hold', icon: <PauseCircle size={14} />, value: 'On Hold' },
    { label: 'Mark Completed', icon: <CheckCircle size={14} />, value: 'Completed' },
  ],
  'On Hold': [
    { label: 'Resume', icon: <PlayCircle size={14} />, value: 'Active' },
    { label: 'Mark Completed', icon: <CheckCircle size={14} />, value: 'Completed' },
  ],
  Completed: [{ label: 'Reactivate', icon: <PlayCircle size={14} />, value: 'Active' }],
};

export default function ProjectGrid({
  projects,
  onSelect,
  selectedId,
  onEdit,
  onDelete,
  onStatusChange,
  viewMode,
  users,
}: ProjectGridProps) {
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const userMap = Object.fromEntries(users.map((user) => [user.id, user]));

  if (projects.length === 0) {
    return (
      <EmptyState
        icon={<FolderKanban size={24} />}
        title="No projects found"
        description="No projects match your current filters. Try adjusting the filters or create a new project."
      />
    );
  }

  if (viewMode === 'list') {
    return (
      <>
        <div className="overflow-hidden rounded-xl border border-border bg-white shadow-card dark:bg-slate-900">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-slate-50 dark:bg-slate-800/50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Project
                </th>
                <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:table-cell">
                  Status
                </th>
                <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground md:table-cell">
                  Progress
                </th>
                <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground lg:table-cell">
                  Due Date
                </th>
                <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground xl:table-cell">
                  Team
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {projects.map((project) => {
                const teamUsers = project.teamIds
                  .map((id) => userMap[id])
                  .filter(Boolean) as WorkspaceUserOption[];
                const overdue = isOverdue(project.dueDate) && project.status !== 'Completed';

                return (
                  <tr
                    key={project.id}
                    onClick={() => onSelect(project)}
                    className={`cursor-pointer transition hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                      selectedId === project.id ? 'bg-indigo-50/50 dark:bg-indigo-950/30' : ''
                    }`}
                  >
                    <td className="px-4 py-3.5">
                      <p className="max-w-[220px] truncate font-semibold text-foreground">
                        {project.title}
                      </p>
                      <p className="mt-0.5 max-w-[220px] truncate text-xs text-muted-foreground">
                        {project.taskCount} tasks
                      </p>
                    </td>
                    <td className="hidden px-4 py-3.5 sm:table-cell">
                      <StatusBadge variant={project.status} />
                    </td>
                    <td className="hidden w-40 px-4 py-3.5 md:table-cell">
                      <ProgressBar value={project.progress} showLabel size="xs" />
                    </td>
                    <td
                      className={`hidden px-4 py-3.5 text-sm lg:table-cell ${
                        overdue ? 'font-semibold text-red-600' : 'text-foreground'
                      }`}
                    >
                      {formatDate(project.dueDate)}
                    </td>
                    <td className="hidden px-4 py-3.5 xl:table-cell">
                      <AvatarStack users={teamUsers} max={3} />
                    </td>
                    <td
                      className="px-4 py-3.5 text-right"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => onEdit(project)}
                          className="rounded-md p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(project)}
                          className="rounded-md p-1.5 text-muted-foreground transition hover:bg-red-50 hover:text-red-600"
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

        <ConfirmModal
          open={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => {
            if (deleteTarget) {
              onDelete(deleteTarget.id);
            }
            setDeleteTarget(null);
          }}
          title="Delete Project"
          description={`Are you sure you want to delete "${deleteTarget?.title}"? All associated tasks will also be removed.`}
          confirmLabel="Delete Project"
        />
      </>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {projects.map((project) => {
          const teamUsers = project.teamIds
            .map((id) => userMap[id])
            .filter(Boolean) as WorkspaceUserOption[];
          const overdue = isOverdue(project.dueDate) && project.status !== 'Completed';
          const isSelected = selectedId === project.id;
          const menuIsOpen = menuOpen === project.id;

          return (
            <div
              key={project.id}
              onClick={() => onSelect(project)}
              className={`relative cursor-pointer rounded-xl border bg-white p-5 shadow-card transition hover:shadow-card-hover dark:bg-slate-900 ${
                isSelected
                  ? 'border-indigo-400 ring-2 ring-indigo-500/20'
                  : 'border-border hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="min-w-0 flex-1 pr-2">
                  <h3 className="truncate text-sm font-semibold text-foreground">
                    {project.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {project.description}
                  </p>
                </div>

                <div
                  className="relative flex-shrink-0"
                  onClick={(event) => event.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => setMenuOpen(menuIsOpen ? null : project.id)}
                    className="rounded-md p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  >
                    <MoreHorizontal size={16} />
                  </button>

                  {menuIsOpen && (
                    <div className="absolute right-0 top-8 z-20 w-48 rounded-lg border border-border bg-white py-1 shadow-card-hover dark:bg-slate-900">
                      <button
                        type="button"
                        onClick={() => {
                          onEdit(project);
                          setMenuOpen(null);
                        }}
                        className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-foreground transition hover:bg-muted"
                      >
                        <Pencil size={14} className="text-muted-foreground" />
                        Edit Project
                      </button>
                      {statusTransitions[project.status].map((transition) => (
                        <button
                          type="button"
                          key={transition.value}
                          onClick={() => {
                            onStatusChange(project.id, transition.value);
                            setMenuOpen(null);
                          }}
                          className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-foreground transition hover:bg-muted"
                        >
                          <span className="text-muted-foreground">{transition.icon}</span>
                          {transition.label}
                        </button>
                      ))}
                      <hr className="my-1 border-border" />
                      <button
                        type="button"
                        onClick={() => {
                          setDeleteTarget(project);
                          setMenuOpen(null);
                        }}
                        className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-red-600 transition hover:bg-red-50 dark:hover:bg-red-950"
                      >
                        <Trash2 size={14} />
                        Delete Project
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {project.tags.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-1">
                  {project.tags.slice(0, 3).map((tag) => (
                    <span
                      key={`${project.id}-${tag}`}
                      className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="mb-4">
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Progress</span>
                  <span className="text-xs font-semibold text-foreground">
                    {project.completedTaskCount}/{project.taskCount} tasks
                  </span>
                </div>
                <ProgressBar value={project.progress} showLabel size="sm" />
              </div>

              <div className="flex items-center justify-between border-t border-border pt-3">
                <StatusBadge variant={project.status} size="sm" />
                <div className="flex items-center gap-3">
                  <div
                    className={`flex items-center gap-1 text-xs ${
                      overdue ? 'font-semibold text-red-600' : 'text-muted-foreground'
                    }`}
                  >
                    <Calendar size={11} />
                    {formatDate(project.dueDate)}
                  </div>
                  <AvatarStack users={teamUsers} max={3} size="sm" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {menuOpen && <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />}

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            onDelete(deleteTarget.id);
          }
          setDeleteTarget(null);
        }}
        title="Delete Project"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? All associated tasks will also be removed.`}
        confirmLabel="Delete Project"
      />
    </>
  );
}
