'use client';

import React, { useState } from 'react';
import { type Project, type ProjectStatus, type User } from '@/lib/mockData';
import StatusBadge from '@/components/ui/StatusBadge';
import ProgressBar from '@/components/ui/ProgressBar';
import AvatarStack from '@/components/ui/AvatarStack';
import ConfirmModal from '@/components/ui/ConfirmModal';
import EmptyState from '@/components/ui/EmptyState';
import { formatDate, isOverdue } from '@/lib/utils';
import { MoreHorizontal, Pencil, Trash2, CheckCircle, PauseCircle, PlayCircle, Calendar, FolderKanban,  } from 'lucide-react';

interface ProjectGridProps {
  projects: Project[];
  onSelect: (p: Project) => void;
  selectedId?: string;
  onEdit: (p: Project) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: ProjectStatus) => void;
  viewMode: 'grid' | 'list';
  users: User[];
}

const STATUS_TRANSITIONS: Record<ProjectStatus, { label: string; icon: React.ReactNode; value: ProjectStatus }[]> = {
  Active: [
    { label: 'Put On Hold', icon: <PauseCircle size={14} />, value: 'On Hold' },
    { label: 'Mark Completed', icon: <CheckCircle size={14} />, value: 'Completed' },
  ],
  'On Hold': [
    { label: 'Resume', icon: <PlayCircle size={14} />, value: 'Active' },
    { label: 'Mark Completed', icon: <CheckCircle size={14} />, value: 'Completed' },
  ],
  Completed: [
    { label: 'Reactivate', icon: <PlayCircle size={14} />, value: 'Active' },
  ],
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

  const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

  if (projects.length === 0) {
    return (
      <EmptyState
        icon={<FolderKanban size={24} />}
        title="No projects found"
        description="No projects match your current filters. Try adjusting the status filter or search query."
      />
    );
  }

  if (viewMode === 'list') {
    return (
      <>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-border shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-slate-50 dark:bg-slate-800/50">
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Project
                </th>
                <th className="hidden sm:table-cell text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
                <th className="hidden md:table-cell text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Progress
                </th>
                <th className="hidden lg:table-cell text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Due Date
                </th>
                <th className="hidden xl:table-cell text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Team
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {projects.map((project) => {
                const teamUsers = project.teamIds.map((id) => userMap[id]).filter(Boolean) as User[];
                const overdue = isOverdue(project.dueDate) && project.status !== 'Completed';
                return (
                  <tr
                    key={`list-row-${project.id}`}
                    onClick={() => onSelect(project)}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors ${
                      selectedId === project.id ? 'bg-indigo-50/50 dark:bg-indigo-950/30' : ''
                    }`}
                  >
                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-foreground truncate max-w-[200px]">
                        {project.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[200px]">
                        {project.taskCount} tasks
                      </p>
                    </td>
                    <td className="hidden sm:table-cell px-4 py-3.5">
                      <StatusBadge variant={project.status} />
                    </td>
                    <td className="hidden md:table-cell px-4 py-3.5 w-40">
                      <ProgressBar value={project.progress} showLabel size="xs" />
                    </td>
                    <td className={`hidden lg:table-cell px-4 py-3.5 text-sm tabular-nums ${overdue ? 'text-red-600 font-semibold' : 'text-foreground'}`}>
                      {formatDate(project.dueDate)}
                    </td>
                    <td className="hidden xl:table-cell px-4 py-3.5">
                      <AvatarStack users={teamUsers} max={3} />
                    </td>
                    <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onEdit(project)}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors opacity-0 group-hover:opacity-100"
                          title="Edit project"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(project)}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete project"
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
            if (deleteTarget) onDelete(deleteTarget.id);
            setDeleteTarget(null);
          }}
          title="Delete Project"
          description={`Are you sure you want to delete "${deleteTarget?.title}"? All associated tasks will also be removed. This cannot be undone.`}
          confirmLabel="Delete Project"
        />
      </>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-4">
        {projects.map((project) => {
          const teamUsers = project.teamIds.map((id) => userMap[id]).filter(Boolean) as User[];
          const overdue = isOverdue(project.dueDate) && project.status !== 'Completed';
          const isSelected = selectedId === project.id;
          const menuIsOpen = menuOpen === project.id;

          return (
            <div
              key={`proj-card-${project.id}`}
              onClick={() => onSelect(project)}
              className={`
                relative bg-white dark:bg-gray-900 rounded-xl border shadow-card
                hover:shadow-card-hover transition-all duration-200 cursor-pointer p-5
                ${isSelected
                  ? 'border-indigo-400 ring-2 ring-indigo-500/20' :'border-border hover:border-slate-300 dark:hover:border-slate-600'}
              `}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0 pr-2">
                  <h3 className="text-sm font-semibold text-foreground leading-snug truncate">
                    {project.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                    {project.description}
                  </p>
                </div>

                {/* Menu */}
                <div className="relative flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => setMenuOpen(menuIsOpen ? null : project.id)}
                    className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <MoreHorizontal size={16} />
                  </button>
                  {menuIsOpen && (
                    <div className="absolute right-0 top-8 z-20 w-48 bg-white dark:bg-gray-800 border border-border rounded-lg shadow-card-hover py-1 scale-in">
                      <button
                        onClick={() => {
                          onEdit(project);
                          setMenuOpen(null);
                        }}
                        className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                      >
                        <Pencil size={14} className="text-muted-foreground" />
                        Edit Project
                      </button>
                      {STATUS_TRANSITIONS[project.status]?.map((t) => (
                        <button
                          key={`status-trans-${t.value}`}
                          onClick={() => {
                            onStatusChange(project.id, t.value);
                            setMenuOpen(null);
                          }}
                          className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                        >
                          <span className="text-muted-foreground">{t.icon}</span>
                          {t.label}
                        </button>
                      ))}
                      <hr className="my-1 border-border" />
                      <button
                        onClick={() => {
                          setDeleteTarget(project);
                          setMenuOpen(null);
                        }}
                        className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                      >
                        <Trash2 size={14} />
                        Delete Project
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Tags */}
              {project.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {project.tags.slice(0, 3).map((tag) => (
                    <span
                      key={`tag-${project.id}-${tag}`}
                      className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-muted-foreground">Progress</span>
                  <span className="text-xs font-semibold text-foreground tabular-nums">
                    {project.completedTaskCount}/{project.taskCount} tasks
                  </span>
                </div>
                <ProgressBar value={project.progress} showLabel size="sm" />
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className="flex items-center gap-2">
                  <StatusBadge variant={project.status} size="sm" />
                </div>

                <div className="flex items-center gap-3">
                  <div
                    className={`flex items-center gap-1 text-xs tabular-nums ${
                      overdue ? 'text-red-600 font-semibold' : 'text-muted-foreground'
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

      {/* Click-outside to close menu */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setMenuOpen(null)}
        />
      )}

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) onDelete(deleteTarget.id);
          setDeleteTarget(null);
        }}
        title="Delete Project"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? All associated tasks will also be removed. This cannot be undone.`}
        confirmLabel="Delete Project"
      />
    </>
  );
}