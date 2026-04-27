'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import {
  type Project,
  type ProjectInput,
  type ProjectStatus,
  type WorkspaceUserOption,
} from '@/lib/types';

interface ProjectFormData {
  title: string;
  description: string;
  status: ProjectStatus;
  dueDate: string;
  teamIds: string[];
  tags: string;
}

interface ProjectFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ProjectInput) => void | Promise<void>;
  initialData?: Project;
  users: WorkspaceUserOption[];
  mode: 'create' | 'edit';
}

export default function ProjectFormModal({
  open,
  onClose,
  onSubmit,
  initialData,
  users,
  mode,
}: ProjectFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormData>({
    defaultValues: {
      title: '',
      description: '',
      status: 'Active',
      dueDate: '',
      teamIds: [],
      tags: '',
    },
  });

  useEffect(() => {
    if (open && initialData) {
      reset({
        title: initialData.title,
        description: initialData.description,
        status: initialData.status,
        dueDate: initialData.dueDate,
        teamIds: initialData.teamIds,
        tags: initialData.tags.join(', '),
      });
    } else if (open) {
      reset({
        title: '',
        description: '',
        status: 'Active',
        dueDate: '',
        teamIds: [],
        tags: '',
      });
    }
  }, [initialData, open, reset]);

  const processSubmit = async (data: ProjectFormData) => {
    await onSubmit({
      title: data.title,
      description: data.description,
      status: data.status,
      dueDate: data.dueDate,
      teamIds: data.teamIds,
      tags: data.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    });
    reset();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === 'create' ? 'Create New Project' : 'Edit Project'}
      subtitle={
        mode === 'create'
          ? 'Fill in the details below to create a new project.'
          : 'Update the project details below.'
      }
      size="lg"
      footer={
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg bg-muted px-4 py-2 text-sm font-medium text-foreground transition hover:bg-slate-200 disabled:opacity-50 dark:hover:bg-slate-700"
          >
            Cancel
          </button>
          <button
            form="project-form"
            type="submit"
            disabled={isSubmitting}
            className="flex min-w-[140px] items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Saving...
              </>
            ) : mode === 'create' ? (
              'Create Project'
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      }
    >
      <form id="project-form" onSubmit={handleSubmit(processSubmit)} className="space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-foreground">
            Project Title <span className="text-red-500">*</span>
          </label>
          <p className="mb-2 text-xs text-muted-foreground">
            A clear, descriptive name for the project.
          </p>
          <input
            type="text"
            placeholder="e.g. Mobile App Redesign"
            {...register('title', {
              required: 'Project title is required',
              minLength: { value: 3, message: 'Title must be at least 3 characters' },
            })}
            className="w-full rounded-lg border border-input bg-white px-3 py-2.5 text-sm transition placeholder:text-muted-foreground focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:bg-gray-800"
          />
          {errors.title && (
            <p className="mt-1.5 text-xs font-medium text-red-600">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-foreground">
            Description <span className="text-red-500">*</span>
          </label>
          <p className="mb-2 text-xs text-muted-foreground">
            Describe the project scope, goals, and expected outcomes.
          </p>
          <textarea
            rows={3}
            placeholder="Describe what this project aims to accomplish..."
            {...register('description', {
              required: 'Description is required',
              minLength: { value: 10, message: 'Description must be at least 10 characters' },
            })}
            className="w-full resize-none rounded-lg border border-input bg-white px-3 py-2.5 text-sm transition placeholder:text-muted-foreground focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:bg-gray-800"
          />
          {errors.description && (
            <p className="mt-1.5 text-xs font-medium text-red-600">{errors.description.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-foreground">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              {...register('status', { required: 'Status is required' })}
              className="w-full rounded-lg border border-input bg-white px-3 py-2.5 text-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:bg-gray-800"
            >
              <option value="Active">Active</option>
              <option value="On Hold">On Hold</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-foreground">
              Due Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              {...register('dueDate', { required: 'Due date is required' })}
              className="w-full rounded-lg border border-input bg-white px-3 py-2.5 text-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:bg-gray-800"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-foreground">Team Members</label>
          <p className="mb-2 text-xs text-muted-foreground">
            Select team members who will work on this project.
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {users.map((user) => (
              <label
                key={user.id}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-input p-2.5 transition hover:bg-muted has-[:checked]:border-indigo-400 has-[:checked]:bg-indigo-50 dark:has-[:checked]:bg-indigo-950"
              >
                <input
                  type="checkbox"
                  value={user.id}
                  {...register('teamIds')}
                  className="h-4 w-4 rounded accent-indigo-600"
                />
                <div
                  className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                  style={{ backgroundColor: user.color }}
                >
                  {user.initials}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.role}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-foreground">Tags</label>
          <p className="mb-2 text-xs text-muted-foreground">
            Comma-separated tags to categorize this project.
          </p>
          <input
            type="text"
            placeholder="Design, Backend, Mobile..."
            {...register('tags')}
            className="w-full rounded-lg border border-input bg-white px-3 py-2.5 text-sm transition placeholder:text-muted-foreground focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:bg-gray-800"
          />
        </div>

        <p className="text-xs text-muted-foreground">
          <span className="text-red-500">*</span> Required fields
        </p>
      </form>
    </Modal>
  );
}
