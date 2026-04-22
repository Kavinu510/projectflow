'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '@/components/ui/Modal';
import { type Project, type User, type ProjectStatus } from '@/lib/mockData';
import { Loader2 } from 'lucide-react';

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
  onSubmit: (data: Partial<Project>) => void;
  initialData?: Project;
  users: User[];
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
    } else if (open && !initialData) {
      reset({
        title: '',
        description: '',
        status: 'Active',
        dueDate: '',
        teamIds: [],
        tags: '',
      });
    }
  }, [open, initialData, reset]);

  const processSubmit = async (data: ProjectFormData) => {
    // Simulate async save — Backend integration point: POST /api/projects or PATCH /api/projects/:id
    await new Promise((r) => setTimeout(r, 600));
    onSubmit({
      title: data.title,
      description: data.description,
      status: data.status,
      dueDate: data.dueDate,
      teamIds: data.teamIds,
      tags: data.tags
        .split(',')
        .map((t) => t.trim())
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
        mode === 'create' ?'Fill in the details below to create a new project.' :'Update the project details below.'
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
            form="project-form"
            type="submit"
            disabled={isSubmitting}
            className="min-w-[140px] px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-lg transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Saving…
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
        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">
            Project Title <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-muted-foreground mb-2">
            A clear, descriptive name for the project.
          </p>
          <input
            type="text"
            placeholder="e.g. Mobile App Redesign"
            {...register('title', { required: 'Project title is required', minLength: { value: 3, message: 'Title must be at least 3 characters' } })}
            className="w-full px-3 py-2.5 text-sm bg-white dark:bg-gray-800 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all placeholder:text-muted-foreground"
          />
          {errors.title && (
            <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.title.message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">
            Description <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-muted-foreground mb-2">
            Describe the project scope, goals, and expected outcomes.
          </p>
          <textarea
            rows={3}
            placeholder="Describe what this project aims to accomplish…"
            {...register('description', { required: 'Description is required', minLength: { value: 10, message: 'Description must be at least 10 characters' } })}
            className="w-full px-3 py-2.5 text-sm bg-white dark:bg-gray-800 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all placeholder:text-muted-foreground resize-none"
          />
          {errors.description && (
            <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.description.message}</p>
          )}
        </div>

        {/* Status + Due Date row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              {...register('status', { required: 'Status is required' })}
              className="w-full px-3 py-2.5 text-sm bg-white dark:bg-gray-800 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
            >
              <option value="Active">Active</option>
              <option value="On Hold">On Hold</option>
              <option value="Completed">Completed</option>
            </select>
            {errors.status && (
              <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.status.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">
              Due Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              {...register('dueDate', { required: 'Due date is required' })}
              className="w-full px-3 py-2.5 text-sm bg-white dark:bg-gray-800 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
            />
            {errors.dueDate && (
              <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.dueDate.message}</p>
            )}
          </div>
        </div>

        {/* Team members */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">
            Team Members
          </label>
          <p className="text-xs text-muted-foreground mb-2">
            Select team members who will work on this project.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {users.map((user) => (
              <label
                key={`team-select-${user.id}`}
                className="flex items-center gap-3 p-2.5 rounded-lg border border-input hover:bg-muted cursor-pointer transition-colors has-[:checked]:border-indigo-400 has-[:checked]:bg-indigo-50 dark:has-[:checked]:bg-indigo-950"
              >
                <input
                  type="checkbox"
                  value={user.id}
                  {...register('teamIds')}
                  className="w-4 h-4 rounded accent-indigo-600"
                />
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
                  style={{ backgroundColor: user.color }}
                >
                  {user.initials}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.role}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">Tags</label>
          <p className="text-xs text-muted-foreground mb-2">
            Comma-separated tags to categorize this project (e.g. Design, Backend, Marketing).
          </p>
          <input
            type="text"
            placeholder="Design, Backend, Mobile…"
            {...register('tags')}
            className="w-full px-3 py-2.5 text-sm bg-white dark:bg-gray-800 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all placeholder:text-muted-foreground"
          />
        </div>

        {/* Required fields note */}
        <p className="text-xs text-muted-foreground">
          <span className="text-red-500">*</span> Required fields
        </p>
      </form>
    </Modal>
  );
}