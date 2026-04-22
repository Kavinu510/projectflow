'use client';

import React, { useState, useMemo } from 'react';
import AppLayout from '@/components/AppLayout';
import { TASKS, PROJECTS, USERS, type Task, type TaskStatus, type TaskPriority } from '@/lib/mockData';
import TaskTable from './components/TaskTable';
import TaskKanban from './components/TaskKanban';
import TaskFormModal from './components/TaskFormModal';
import TaskFilterPanel from './components/TaskFilterPanel';
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

export default function TaskListViewPage() {
  const [tasks, setTasks] = useState<Task[]>(TASKS);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

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
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
      );
    }
    if (filters.projectIds.length > 0) {
      result = result.filter((t) => filters.projectIds.includes(t.projectId));
    }
    if (filters.assigneeIds.length > 0) {
      result = result.filter((t) => filters.assigneeIds.includes(t.assigneeId));
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

  const handleCreateTask = (data: Partial<Task>) => {
    const newTask: Task = {
      id: `task-${String(tasks.length + 1).padStart(3, '0')}`,
      projectId: data.projectId ?? 'proj-001',
      title: data.title ?? 'Untitled Task',
      description: data.description ?? '',
      assigneeId: data.assigneeId ?? 'user-001',
      status: data.status ?? 'To-Do',
      priority: data.priority ?? 'Medium',
      dueDate: data.dueDate ?? '2026-05-31',
      createdDate: '2026-04-22',
    };
    setTasks((prev) => [newTask, ...prev]);
    setFormOpen(false);
    toast.success(`Task "${newTask.title}" created`);
  };

  const handleEditTask = (data: Partial<Task>) => {
    if (!editingTask) return;
    setTasks((prev) =>
      prev.map((t) => (t.id === editingTask.id ? { ...t, ...data } : t))
    );
    setEditingTask(null);
    setFormOpen(false);
    toast.success('Task updated');
  };

  const handleDeleteTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(taskId);
      return next;
    });
    toast.success(`"${task?.title}" deleted`);
  };

  const handleStatusChange = (taskId: string, status: TaskStatus) => {
    // Backend integration point: PATCH /api/tasks/:id { status }
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status } : t)));
    toast.success('Task status updated');
  };

  const handleBulkDelete = () => {
    const count = selectedIds.size;
    setTasks((prev) => prev.filter((t) => !selectedIds.has(t.id)));
    setSelectedIds(new Set());
    toast.success(`${count} task${count > 1 ? 's' : ''} deleted`);
  };

  const handleBulkStatusChange = (status: TaskStatus) => {
    const count = selectedIds.size;
    setTasks((prev) =>
      prev.map((t) => (selectedIds.has(t.id) ? { ...t, status } : t))
    );
    setSelectedIds(new Set());
    toast.success(`${count} task${count > 1 ? 's' : ''} moved to ${status}`);
  };

  const handleKanbanMove = (taskId: string, newStatus: TaskStatus) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));
  };

  return (
    <AppLayout currentPath="/task-list-view">
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
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800' :'bg-white dark:bg-gray-900 text-foreground border-border hover:bg-muted'
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
                  viewMode === 'list' ?'bg-white dark:bg-gray-900 text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
                }`}
                aria-label="List view"
              >
                <List size={16} />
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'kanban' ?'bg-white dark:bg-gray-900 text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
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
            projects={PROJECTS}
            users={USERS}
            onClose={() => setFilterPanelOpen(false)}
          />
        )}

        {/* Content */}
        {viewMode === 'list' ? (
          <TaskTable
            tasks={filteredTasks}
            projects={PROJECTS}
            users={USERS}
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
            projects={PROJECTS}
            users={USERS}
            onMove={handleKanbanMove}
            onEdit={(t) => {
              setEditingTask(t);
              setFormOpen(true);
            }}
            onDelete={handleDeleteTask}
          />
        )}
      </div>

      <TaskFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingTask(null);
        }}
        onSubmit={editingTask ? handleEditTask : handleCreateTask}
        initialData={editingTask ?? undefined}
        projects={PROJECTS}
        users={USERS}
        mode={editingTask ? 'edit' : 'create'}
      />
    </AppLayout>
  );
}