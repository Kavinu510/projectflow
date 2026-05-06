'use client';

import React, { useMemo, useRef, useState } from 'react';
import {
  type Task,
  type Project,
  type WorkspaceUserOption,
  type TaskStatus,
  type TaskPriority,
} from '@/lib/types';
import TaskTable from './TaskTable';
import TaskKanban from './TaskKanban';
import TaskFormModal from './TaskFormModal';
import TaskFilterPanel from './TaskFilterPanel';
import { Plus, List, Columns, SlidersHorizontal } from 'lucide-react';
import { toast } from 'sonner';

export type ViewMode = 'list' | 'kanban';

export interface TaskFilters {
  search: string;
  projectIds: string[];
  assigneeIds: string[];
  priorities: TaskPriority[];
  statuses: TaskStatus[];
}

interface TaskListViewClientProps {
  initialTasks: Task[];
  projects: Project[];
  users: WorkspaceUserOption[];
}

interface TaskRecordResponse {
  id: string;
  workspace_id: string;
  project_id: string;
  title: string;
  description: string;
  assignee_id: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export default function TaskListViewClient({
  initialTasks,
  projects,
  users,
}: TaskListViewClientProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const statusRequestVersionRef = useRef<Record<string, number>>({});

  const [filters, setFilters] = useState<TaskFilters>({
    search: '',
    projectIds: [],
    assigneeIds: [],
    priorities: [],
    statuses: [],
  });

  const filteredTasks = useMemo(() => {
    let result = tasks;

    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (t) => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
      );
    }
    if (filters.projectIds.length > 0) {
      result = result.filter((t) => filters.projectIds.includes(t.projectId));
    }
    if (filters.assigneeIds.length > 0) {
      result = result.filter((t) => t.assigneeId && filters.assigneeIds.includes(t.assigneeId));
    }
    if (filters.priorities.length > 0) {
      result = result.filter((t) => filters.priorities.includes(t.priority));
    }
    if (filters.statuses.length > 0) {
      result = result.filter((t) => filters.statuses.includes(t.status));
    }

    return result;
  }, [tasks, filters]);

  const activeFilterCount =
    filters.projectIds.length +
    filters.assigneeIds.length +
    filters.priorities.length +
    filters.statuses.length;

  function toTaskModel(record: TaskRecordResponse): Task {
    return {
      id: record.id,
      workspaceId: record.workspace_id,
      projectId: record.project_id,
      title: record.title,
      description: record.description,
      assigneeId: record.assignee_id,
      status: record.status,
      priority: record.priority,
      dueDate: record.due_date,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
      createdBy: record.created_by,
    };
  }

  const handleCreateTask = async (data: Partial<Task>) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = (await res.json()) as { error?: string };
        throw new Error(error.error ?? 'Failed to create task');
      }

      const payload = (await res.json()) as { task: TaskRecordResponse };
      const createdTask = toTaskModel(payload.task);
      setTasks((previous) =>
        [...previous, createdTask].sort((left, right) => left.dueDate.localeCompare(right.dueDate))
      );

      setFormOpen(false);
      toast.success(`Task created`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not create task';
      toast.error(message);
      throw error;
    }
  };

  const handleEditTask = async (data: Partial<Task>) => {
    if (!editingTask) return;
    try {
      const res = await fetch(`/api/tasks/${editingTask.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Failed to update task');

      setTasks((prev) => prev.map((t) => (t.id === editingTask.id ? { ...t, ...data } : t)));
      setEditingTask(null);
      setFormOpen(false);
      toast.success('Task updated');
    } catch (_error) {
      toast.error('Could not update task');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete task');

      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(taskId);
        return next;
      });
      toast.success(`Task deleted`);
    } catch (_error) {
      toast.error('Could not delete task');
    }
  };

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    let previousStatus: TaskStatus | null = null;
    let requestPayload: Partial<Task> | null = null;

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) {
          return t;
        }

        previousStatus = t.status;
        requestPayload = {
          title: t.title,
          description: t.description,
          projectId: t.projectId,
          assigneeId: t.assigneeId,
          priority: t.priority,
          dueDate: t.dueDate,
          status,
        };

        return { ...t, status };
      })
    );

    if (!requestPayload || !previousStatus) {
      return;
    }
    const rollbackStatus: TaskStatus = previousStatus;

    const nextVersion = (statusRequestVersionRef.current[taskId] ?? 0) + 1;
    statusRequestVersionRef.current[taskId] = nextVersion;

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPayload),
      });
      if (!res.ok) {
        const error = (await res.json()) as { error?: string };
        throw new Error(error.error ?? 'Failed to update status');
      }

      if (statusRequestVersionRef.current[taskId] !== nextVersion) {
        return;
      }

      toast.success('Task status updated');
    } catch (error) {
      if (statusRequestVersionRef.current[taskId] !== nextVersion) {
        return;
      }

      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId && t.status === status ? { ...t, status: rollbackStatus } : t
        )
      );

      const message = error instanceof Error ? error.message : 'Could not update status';
      toast.error(message);
    }
  };

  const handleBulkDelete = async () => {
    const count = selectedIds.size;
    const ids = Array.from(selectedIds);

    try {
      await Promise.all(ids.map((id) => fetch(`/api/tasks/${id}`, { method: 'DELETE' })));
      setTasks((prev) => prev.filter((t) => !selectedIds.has(t.id)));
      setSelectedIds(new Set());
      toast.success(`${count} task${count > 1 ? 's' : ''} deleted`);
    } catch (_error) {
      toast.error('Some tasks could not be deleted');
    }
  };

  const handleBulkStatusChange = async (status: TaskStatus) => {
    const count = selectedIds.size;
    const ids = Array.from(selectedIds);
    const prevTasks = [...tasks];

    setTasks((prev) => prev.map((t) => (selectedIds.has(t.id) ? { ...t, status } : t)));
    setSelectedIds(new Set());

    try {
      await Promise.all(
        ids.map((id) => {
          const currentTask = prevTasks.find((t) => t.id === id);
          if (!currentTask) return Promise.resolve();
          return fetch(`/api/tasks/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: currentTask.title,
              description: currentTask.description,
              projectId: currentTask.projectId,
              assigneeId: currentTask.assigneeId,
              priority: currentTask.priority,
              dueDate: currentTask.dueDate,
              status,
            }),
          });
        })
      );
      toast.success(`${count} task${count > 1 ? 's' : ''} moved to ${status}`);
    } catch (_error) {
      setTasks(prevTasks);
      toast.error('Some tasks could not be updated');
    }
  };

  const handleKanbanMove = async (taskId: string, newStatus: TaskStatus) => {
    const currentTask = tasks.find((t) => t.id === taskId);
    if (!currentTask) return;

    const prevTasks = [...tasks];
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: currentTask.title,
          description: currentTask.description,
          projectId: currentTask.projectId,
          assigneeId: currentTask.assigneeId,
          priority: currentTask.priority,
          dueDate: currentTask.dueDate,
          status: newStatus,
        }),
      });
      if (!res.ok) throw new Error('Failed to update status');
    } catch (_error) {
      setTasks(prevTasks);
      toast.error('Could not update status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">All Tasks</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {filteredTasks.length} of {tasks.length} tasks
            {activeFilterCount > 0 && (
              <span className="ml-1.5 text-indigo-600 font-medium">
                · {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterPanelOpen((p) => !p)}
            className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-all ${
              filterPanelOpen || activeFilterCount > 0
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800'
                : 'bg-white dark:bg-gray-900 text-foreground border-border hover:bg-muted'
            }`}
          >
            <SlidersHorizontal size={15} />
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-indigo-600 text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center tabular-nums">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* View toggle */}
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-gray-900 text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              aria-label="List view"
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-gray-900 text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              aria-label="Kanban view"
            >
              <Columns size={16} />
            </button>
          </div>

          <button
            onClick={() => {
              setEditingTask(null);
              setFormOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-sm font-semibold rounded-lg transition-all shadow-sm"
          >
            <Plus size={15} />
            New Task
          </button>
        </div>
      </div>

      {/* Filter panel */}
      {filterPanelOpen && (
        <TaskFilterPanel
          filters={filters}
          onChange={setFilters}
          projects={projects}
          users={users}
          onClose={() => setFilterPanelOpen(false)}
        />
      )}

      {/* Content */}
      {viewMode === 'list' ? (
        <TaskTable
          tasks={filteredTasks}
          projects={projects}
          users={users}
          selectedIds={selectedIds}
          onSelectChange={setSelectedIds}
          onEdit={(t) => {
            setEditingTask(t);
            setFormOpen(true);
          }}
          onDelete={handleDeleteTask}
          onStatusChange={handleStatusChange}
          onBulkDelete={handleBulkDelete}
          onBulkStatusChange={handleBulkStatusChange}
          filters={filters}
          onSearchChange={(s) => setFilters((f) => ({ ...f, search: s }))}
        />
      ) : (
        <TaskKanban
          tasks={filteredTasks}
          projects={projects}
          users={users}
          onMove={handleKanbanMove}
          onEdit={(t) => {
            setEditingTask(t);
            setFormOpen(true);
          }}
          onDelete={handleDeleteTask}
        />
      )}

      <TaskFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingTask(null);
        }}
        onSubmit={editingTask ? handleEditTask : handleCreateTask}
        initialData={editingTask ?? undefined}
        projects={projects}
        users={users}
        mode={editingTask ? 'edit' : 'create'}
      />
    </div>
  );
}
