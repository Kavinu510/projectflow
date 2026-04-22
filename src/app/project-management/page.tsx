'use client';

import React, { useState, useMemo } from 'react';
import AppLayout from '@/components/AppLayout';
import { PROJECTS, TASKS, USERS, type Project, type ProjectStatus } from '@/lib/mockData';
import ProjectGrid from './components/ProjectGrid';
import ProjectDetailPanel from './components/ProjectDetailPanel';
import ProjectFormModal from './components/ProjectFormModal';
import { Plus, Search, Grid, List } from 'lucide-react';
import { toast } from 'sonner';

type StatusFilter = 'All' | ProjectStatus;

const STATUS_FILTERS: StatusFilter[] = ['All', 'Active', 'On Hold', 'Completed'];

export default function ProjectManagementPage() {
  const [projects, setProjects] = useState<Project[]>(PROJECTS);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filtered = useMemo(() => {
    let result = projects;
    if (statusFilter !== 'All') {
      result = result.filter((p) => p.status === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return result;
  }, [projects, statusFilter, searchQuery]);

  const handleCreate = (data: Partial<Project>) => {
    const newProject: Project = {
      id: `proj-${String(projects.length + 1).padStart(3, '0')}`,
      title: data.title ?? 'Untitled Project',
      description: data.description ?? '',
      status: data.status ?? 'Active',
      progress: 0,
      createdDate: '2026-04-22',
      dueDate: data.dueDate ?? '2026-12-31',
      teamIds: data.teamIds ?? [],
      taskCount: 0,
      completedTaskCount: 0,
      tags: data.tags ?? [],
    };
    setProjects((prev) => [newProject, ...prev]);
    setFormOpen(false);
    toast.success(`Project "${newProject.title}" created successfully`);
  };

  const handleEdit = (data: Partial<Project>) => {
    if (!editingProject) return;
    setProjects((prev) =>
      prev.map((p) => (p.id === editingProject.id ? { ...p, ...data } : p))
    );
    setEditingProject(null);
    setFormOpen(false);
    toast.success('Project updated');
  };

  const handleDelete = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    if (selectedProject?.id === projectId) setSelectedProject(null);
    toast.success(`"${project?.title}" deleted`);
  };

  const handleStatusChange = (projectId: string, status: ProjectStatus) => {
    setProjects((prev) => prev.map((p) => (p.id === projectId ? { ...p, status } : p)));
    toast.success('Project status updated');
  };

  const projectTasks = selectedProject
    ? TASKS.filter((t) => t.projectId === selectedProject.id)
    : [];

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { All: projects.length };
    STATUS_FILTERS.slice(1).forEach((s) => {
      counts[s] = projects.filter((p) => p.status === s).length;
    });
    return counts;
  }, [projects]);

  return (
    <AppLayout currentPath="/project-management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Projects</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {projects.length} total · {projects.filter((p) => p.status === 'Active').length} active
            </p>
          </div>
          <button
            onClick={() => {
              setEditingProject(null);
              setFormOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-sm font-semibold rounded-lg transition-all duration-150 shadow-sm"
          >
            <Plus size={16} />
            New Project
          </button>
        </div>

        {/* Filters + Search */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          {/* Status tabs */}
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1 flex-wrap">
            {STATUS_FILTERS.map((f) => (
              <button
                key={`filter-${f}`}
                onClick={() => setStatusFilter(f)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-150 whitespace-nowrap
                  ${
                    statusFilter === f
                      ? 'bg-white dark:bg-gray-900 text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                {f}
                <span
                  className={`ml-1.5 text-xs tabular-nums ${
                    statusFilter === f ? 'text-indigo-600' : 'text-muted-foreground'
                  }`}
                >
                  {statusCounts[f]}
                </span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              placeholder="Search projects…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-gray-900 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
            />
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1 ml-auto">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'grid' ?'bg-white dark:bg-gray-900 text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
              }`}
              aria-label="Grid view"
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'list' ?'bg-white dark:bg-gray-900 text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
              }`}
              aria-label="List view"
            >
              <List size={16} />
            </button>
          </div>
        </div>

        {/* Main content area */}
        <div className={`flex gap-6 ${selectedProject ? 'items-start' : ''}`}>
          {/* Project grid */}
          <div className={`flex-1 min-w-0 ${selectedProject ? 'hidden xl:block' : ''}`}>
            <ProjectGrid
              projects={filtered}
              onSelect={setSelectedProject}
              selectedId={selectedProject?.id}
              onEdit={(p) => {
                setEditingProject(p);
                setFormOpen(true);
              }}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
              viewMode={viewMode}
              users={USERS}
            />
          </div>

          {/* Detail panel */}
          {selectedProject && (
            <div className="w-full xl:w-[440px] flex-shrink-0">
              <ProjectDetailPanel
                project={selectedProject}
                tasks={projectTasks}
                users={USERS}
                onClose={() => setSelectedProject(null)}
                onEdit={() => {
                  setEditingProject(selectedProject);
                  setFormOpen(true);
                }}
                onDelete={() => handleDelete(selectedProject.id)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit modal */}
      <ProjectFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingProject(null);
        }}
        onSubmit={editingProject ? handleEdit : handleCreate}
        initialData={editingProject ?? undefined}
        users={USERS}
        mode={editingProject ? 'edit' : 'create'}
      />
    </AppLayout>
  );
}