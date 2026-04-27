'use client';

import React, { useMemo, useState } from 'react';
import { Grid, List, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import ProjectDetailPanel from '@/app/project-management/components/ProjectDetailPanel';
import ProjectFormModal from '@/app/project-management/components/ProjectFormModal';
import ProjectGrid from '@/app/project-management/components/ProjectGrid';
import {
  type Project,
  type ProjectInput,
  type ProjectStatus,
  type Task,
  type WorkspaceUserOption,
} from '@/lib/types';

type StatusFilter = 'All' | ProjectStatus;

const statusFilters: StatusFilter[] = ['All', 'Active', 'On Hold', 'Completed'];

interface ProjectManagementClientProps {
  initialProjects: Project[];
  initialTasks: Task[];
  users: WorkspaceUserOption[];
}

export default function ProjectManagementClient({
  initialProjects,
  initialTasks,
  users,
}: ProjectManagementClientProps) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const refreshData = async () => {
    const [projectResponse, taskResponse] = await Promise.all([
      fetch('/api/projects', { cache: 'no-store' }),
      fetch('/api/tasks', { cache: 'no-store' }),
    ]);

    const projectData = (await projectResponse.json()) as { projects: Project[] };
    const taskData = (await taskResponse.json()) as { tasks: Task[] };

    setProjects(projectData.projects);
    setTasks(taskData.tasks);
    setSelectedProject((previous) =>
      previous ? (projectData.projects.find((project) => project.id === previous.id) ?? null) : null
    );
  };

  const filteredProjects = useMemo(() => {
    let result = projects;

    if (statusFilter !== 'All') {
      result = result.filter((project) => project.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (project) =>
          project.title.toLowerCase().includes(query) ||
          project.description.toLowerCase().includes(query) ||
          project.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    return result;
  }, [projects, searchQuery, statusFilter]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { All: projects.length };
    statusFilters.slice(1).forEach((status) => {
      counts[status] = projects.filter((project) => project.status === status).length;
    });
    return counts;
  }, [projects]);

  const projectTasks = selectedProject
    ? tasks.filter((task) => task.projectId === selectedProject.id)
    : [];

  const submitProject = async (payload: ProjectInput) => {
    const endpoint = editingProject ? `/api/projects/${editingProject.id}` : '/api/projects';
    const method = editingProject ? 'PATCH' : 'POST';

    const response = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = (await response.json()) as { error?: string };
      throw new Error(error.error ?? 'Unable to save project.');
    }

    await refreshData();
    toast.success(editingProject ? 'Project updated' : 'Project created');
    setFormOpen(false);
    setEditingProject(null);
  };

  const handleDelete = async (projectId: string) => {
    const response = await fetch(`/api/projects/${projectId}`, { method: 'DELETE' });

    if (!response.ok) {
      const error = (await response.json()) as { error?: string };
      toast.error(error.error ?? 'Unable to delete project.');
      return;
    }

    await refreshData();
    toast.success('Project deleted');
  };

  const handleStatusChange = async (projectId: string, status: ProjectStatus) => {
    const currentProject = projects.find((project) => project.id === projectId);

    if (!currentProject) {
      return;
    }

    await submitProject({
      title: currentProject.title,
      description: currentProject.description,
      dueDate: currentProject.dueDate,
      tags: currentProject.tags,
      teamIds: currentProject.teamIds,
      status,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Projects</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {projects.length} total ·{' '}
            {projects.filter((project) => project.status === 'Active').length} active
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingProject(null);
            setFormOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          <Plus size={16} />
          New Project
        </button>
      </div>

      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-wrap items-center gap-1 rounded-lg bg-muted p-1">
          {statusFilters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setStatusFilter(filter)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                statusFilter === filter
                  ? 'bg-white text-foreground shadow-sm dark:bg-slate-900'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {filter}
              <span className="ml-1.5 text-xs text-indigo-600">{statusCounts[filter]}</span>
            </button>
          ))}
        </div>

        <div className="relative max-w-xs flex-1">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full rounded-lg border border-input bg-white py-2 pl-9 pr-4 text-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:bg-slate-900"
          />
        </div>

        <div className="ml-auto flex items-center gap-1 rounded-lg bg-muted p-1">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`rounded-md p-1.5 ${
              viewMode === 'grid'
                ? 'bg-white text-foreground shadow-sm dark:bg-slate-900'
                : 'text-muted-foreground'
            }`}
          >
            <Grid size={16} />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`rounded-md p-1.5 ${
              viewMode === 'list'
                ? 'bg-white text-foreground shadow-sm dark:bg-slate-900'
                : 'text-muted-foreground'
            }`}
          >
            <List size={16} />
          </button>
        </div>
      </div>

      <div className={`flex gap-6 ${selectedProject ? 'items-start' : ''}`}>
        <div className={`min-w-0 flex-1 ${selectedProject ? 'hidden xl:block' : ''}`}>
          <ProjectGrid
            projects={filteredProjects}
            onSelect={setSelectedProject}
            selectedId={selectedProject?.id}
            onEdit={(project) => {
              setEditingProject(project);
              setFormOpen(true);
            }}
            onDelete={(projectId) => void handleDelete(projectId)}
            onStatusChange={(projectId, status) => void handleStatusChange(projectId, status)}
            viewMode={viewMode}
            users={users}
          />
        </div>

        {selectedProject && (
          <div className="w-full flex-shrink-0 xl:w-[440px]">
            <ProjectDetailPanel
              project={selectedProject}
              tasks={projectTasks}
              users={users}
              onClose={() => setSelectedProject(null)}
              onEdit={() => {
                setEditingProject(selectedProject);
                setFormOpen(true);
              }}
              onDelete={() => void handleDelete(selectedProject.id)}
            />
          </div>
        )}
      </div>

      <ProjectFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingProject(null);
        }}
        onSubmit={(payload) => void submitProject(payload)}
        initialData={editingProject ?? undefined}
        users={users}
        mode={editingProject ? 'edit' : 'create'}
      />
    </div>
  );
}
