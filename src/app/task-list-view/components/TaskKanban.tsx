'use client';

import React, { useState } from 'react';
import { type Task, type Project, type WorkspaceUserOption, type TaskStatus } from '@/lib/types';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatDate, isOverdue } from '@/lib/utils';
import { Pencil, Trash2, GripVertical } from 'lucide-react';

const COLUMNS: { status: TaskStatus; label: string; color: string }[] = [
  { status: 'To-Do', label: 'To-Do', color: 'bg-slate-200 dark:bg-slate-700' },
  { status: 'In Progress', label: 'In Progress', color: 'bg-blue-200 dark:bg-blue-900' },
  { status: 'Review', label: 'Review', color: 'bg-amber-200 dark:bg-amber-900' },
  { status: 'Done', label: 'Done', color: 'bg-emerald-200 dark:bg-emerald-900' },
];

interface TaskKanbanProps {
  tasks: Task[];
  projects: Project[];
  users: WorkspaceUserOption[];
  onMove: (taskId: string, newStatus: TaskStatus) => void;
  onEdit: (t: Task) => void;
  onDelete: (id: string) => void;
}

export default function TaskKanban({
  tasks,
  projects,
  users,
  onMove,
  onEdit,
  onDelete,
}: TaskKanbanProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<TaskStatus | null>(null);

  const projectMap = Object.fromEntries(projects.map((p) => [p.id, p]));
  const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

  const getColTasks = (status: TaskStatus) => tasks.filter((t) => t.status === status);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggingId(taskId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCol(status);
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) onMove(taskId, status);
    setDraggingId(null);
    setDragOverCol(null);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setDragOverCol(null);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 pb-4">
      {COLUMNS.map((col) => {
        const colTasks = getColTasks(col.status);
        const isOver = dragOverCol === col.status;

        return (
          <div
            key={`kanban-col-${col.status}`}
            onDragOver={(e) => handleDragOver(e, col.status)}
            onDrop={(e) => handleDrop(e, col.status)}
            onDragLeave={() => setDragOverCol(null)}
            className={`flex flex-col rounded-xl border-2 transition-all duration-150 min-h-[400px] ${
              isOver
                ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-950/30'
                : 'border-border bg-slate-50 dark:bg-slate-800/30'
            }`}
          >
            {/* Column header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${col.color}`} />
                <h3 className="text-sm font-semibold text-foreground">{col.label}</h3>
              </div>
              <span className="text-xs font-bold tabular-nums text-muted-foreground bg-white dark:bg-gray-800 border border-border rounded-full px-2 py-0.5">
                {colTasks.length}
              </span>
            </div>

            {/* Cards */}
            <div className="flex-1 p-3 space-y-2.5 overflow-y-auto scrollbar-thin">
              {colTasks.length === 0 && (
                <div
                  className={`flex items-center justify-center h-20 rounded-lg border-2 border-dashed text-xs text-muted-foreground transition-colors ${
                    isOver ? 'border-indigo-400 text-indigo-500' : 'border-border'
                  }`}
                >
                  {isOver ? 'Drop here' : 'No tasks'}
                </div>
              )}
              {colTasks.map((task) => {
                const project = projectMap[task.projectId];
                const assignee = task.assigneeId ? userMap[task.assigneeId] : null;
                const overdue = isOverdue(task.dueDate) && task.status !== 'Done';
                const isDragging = draggingId === task.id;

                return (
                  <div
                    key={`kanban-card-${task.id}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onDragEnd={handleDragEnd}
                    className={`group bg-white dark:bg-gray-900 rounded-lg border border-border p-3 cursor-grab active:cursor-grabbing shadow-card hover:shadow-card-hover transition-all duration-150 ${
                      isDragging ? 'opacity-40 scale-95' : 'opacity-100'
                    }`}
                  >
                    {/* Drag handle + actions */}
                    <div className="flex items-start justify-between mb-2">
                      <GripVertical
                        size={14}
                        className="text-muted-foreground/40 group-hover:text-muted-foreground flex-shrink-0 mt-0.5 transition-colors"
                      />
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onEdit(task)}
                          className="p-1 rounded text-muted-foreground hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors"
                          title="Edit task"
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          onClick={() => onDelete(task.id)}
                          className="p-1 rounded text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                          title="Delete task"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>

                    {/* Title */}
                    <p className="text-sm font-semibold text-foreground leading-snug mb-2">
                      {task.title}
                    </p>

                    {/* Project badge */}
                    {project && (
                      <span className="text-xs px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded font-medium truncate inline-block max-w-full mb-2">
                        {project.title}
                      </span>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
                      <StatusBadge variant={task.priority} size="sm" showDot={false} />
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs tabular-nums ${
                            overdue ? 'text-red-600 font-semibold' : 'text-muted-foreground'
                          }`}
                        >
                          {formatDate(task.dueDate)}
                        </span>
                        {assignee && (
                          <div
                            className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
                            style={{ backgroundColor: assignee.color }}
                            title={assignee.name}
                          >
                            {assignee.initials}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
