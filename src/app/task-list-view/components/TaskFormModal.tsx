'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '@/components/ui/Modal';
import {
  type Task,
  type Project,
  type WorkspaceUserOption,
  type TaskStatus,
  type TaskPriority,
} from '@/lib/types';
import { Loader2 } from 'lucide-react';

interface TaskFormData {
  title: string;
  description: string;
  projectId: string;
  assigneeId: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
}

interface TaskFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Task>) => void;
  initialData?: Task;
  projects: Project[];
  users: WorkspaceUserOption[];
  mode: 'create' | 'edit';
}

export default function TaskFormModal({
  open,
  onClose,
  onSubmit,
  initialData,
  projects,
  users,
  mode,
}: TaskFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormData>({
    defaultValues: {
      title: '',
      description: '',
      projectId: projects[0]?.id ?? '',
      assigneeId: users[0]?.id ?? '',
      status: 'To-Do',
      priority: 'Medium',
      dueDate: '',
    },
  });

  useEffect(() => {
    if (open && initialData) {
      reset({
        title: initialData.title,
        description: initialData.description,
        projectId: initialData.projectId,
        assigneeId: initialData.assigneeId ?? '',
        status: initialData.status,
        priority: initialData.priority,
        dueDate: initialData.dueDate,
      });
    } else if (open && !initialData) {
      reset({
        title: '',
        description: '',
        projectId: projects[0]?.id ?? '',
        assigneeId: users[0]?.id ?? '',
        status: 'To-Do',
        priority: 'Medium',
        dueDate: '',
      });
    }
  }, [open, initialData, reset, projects, users]);

  const processSubmit = async (data: TaskFormData) => {
    onSubmit({ ...data, assigneeId: data.assigneeId || null });
    reset();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === 'create' ? 'Create New Task' : 'Edit Task'}
      subtitle={
        mode === 'create'
          ? 'Add a new task and assign it to a team member.'
          : 'Update the task details below.'
      }
      size="lg"
      footer={
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-foreground bg-muted hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            form="task-form"
            type="submit"
            disabled={isSubmitting}
            className="min-w-[120px] px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-lg transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Saving…
              </>
            ) : mode === 'create' ? (
              'Create Task'
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      }
    >
      <form id="task-form" onSubmit={handleSubmit(processSubmit)} className="space-y-5">
        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">
            Task Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Implement dark mode tokens"
            {...register('title', {
              required: 'Task title is required',
              minLength: { value: 3, message: 'Title must be at least 3 characters' },
            })}
            className="w-full px-3 py-2.5 text-sm bg-white dark:bg-gray-800 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all placeholder:text-muted-foreground"
          />
          {errors.title && (
            <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.title.message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">Description</label>
          <p className="text-xs text-muted-foreground mb-2">
            Provide context on what needs to be done and any acceptance criteria.
          </p>
          <textarea
            rows={3}
            placeholder="Describe the task, acceptance criteria, or any relevant context…"
            {...register('description')}
            className="w-full px-3 py-2.5 text-sm bg-white dark:bg-gray-800 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all placeholder:text-muted-foreground resize-none"
          />
        </div>

        {/* Project + Assignee */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">
              Project <span className="text-red-500">*</span>
            </label>
            <select
              {...register('projectId', { required: 'Project is required' })}
              className="w-full px-3 py-2.5 text-sm bg-white dark:bg-gray-800 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
            >
              {projects.map((p) => (
                <option key={`task-proj-opt-${p.id}`} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
            {errors.projectId && (
              <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.projectId.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">
              Assignee <span className="text-red-500">*</span>
            </label>
            <select
              {...register('assigneeId', { required: 'Assignee is required' })}
              className="w-full px-3 py-2.5 text-sm bg-white dark:bg-gray-800 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
            >
              {users.map((u) => (
                <option key={`task-user-opt-${u.id}`} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
            {errors.assigneeId && (
              <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.assigneeId.message}</p>
            )}
          </div>
        </div>

        {/* Status + Priority */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              {...register('status', { required: true })}
              className="w-full px-3 py-2.5 text-sm bg-white dark:bg-gray-800 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
            >
              <option value="To-Do">To-Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Review">Review</option>
              <option value="Done">Done</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">
              Priority <span className="text-red-500">*</span>
            </label>
            <select
              {...register('priority', { required: true })}
              className="w-full px-3 py-2.5 text-sm bg-white dark:bg-gray-800 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        {/* Due Date */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">
            Due Date <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-muted-foreground mb-2">
            Set a realistic deadline. Overdue tasks will be highlighted in red across the app.
          </p>
          <input
            type="date"
            {...register('dueDate', { required: 'Due date is required' })}
            className="w-full px-3 py-2.5 text-sm bg-white dark:bg-gray-800 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
          />
          {errors.dueDate && (
            <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.dueDate.message}</p>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          <span className="text-red-500">*</span> Required fields
        </p>
      </form>
    </Modal>
  );
}
