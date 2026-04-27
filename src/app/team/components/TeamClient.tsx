'use client';

import React, { useState } from 'react';
import { type TeamPageData, type WorkspaceRole, type Project } from '@/lib/types';
import { Plus, Shield, Loader2, FolderKanban } from 'lucide-react';
import { toast } from 'sonner';
import Modal from '@/components/ui/Modal';
import { useForm } from 'react-hook-form';

export default function TeamClient({ initialData }: { initialData: TeamPageData }) {
  const [members, setMembers] = useState(initialData.members);
  const [projects] = useState<Project[]>(initialData.projects);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: { email: '', fullName: '', role: 'member' as WorkspaceRole },
  });

  const selectedMember = members.find((m) => m.id === selectedMemberId);
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);

  const handleInvite = async (data: { email: string; fullName: string; role: WorkspaceRole }) => {
    try {
      const res = await fetch('/api/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to invite');

      const refreshRes = await fetch('/api/team');
      if (refreshRes.ok) {
        const freshData = await refreshRes.json();
        setMembers(freshData.members);
      }
      setInviteModalOpen(false);
      reset();
      toast.success('Invitation sent');
    } catch (_error) {
      toast.error('Could not send invitation');
    }
  };

  const updateRole = async (memberId: string, role: WorkspaceRole) => {
    const prev = [...members];
    setMembers(prev.map((m) => (m.id === memberId ? { ...m, role } : m)));
    try {
      const res = await fetch(`/api/team/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success('Role updated');
    } catch (_error) {
      setMembers(prev);
      toast.error('Could not update role');
    }
  };

  const openProjectAssignment = (memberId: string) => {
    const member = members.find((m) => m.id === memberId);
    if (member) {
      setSelectedMemberId(memberId);
      setSelectedProjectIds(member.projectIds || []);
      setProjectModalOpen(true);
    }
  };

  const handleProjectSync = async () => {
    if (!selectedMemberId) return;
    try {
      const res = await fetch(`/api/team/${selectedMemberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectIds: selectedProjectIds }),
      });
      if (!res.ok) throw new Error('Failed');

      const refreshRes = await fetch('/api/team');
      if (refreshRes.ok) {
        const freshData = await refreshRes.json();
        setMembers(freshData.members);
      }
      setProjectModalOpen(false);
      toast.success('Project assignments updated');
    } catch (_error) {
      toast.error('Could not update project assignments');
    }
  };

  const toggleProject = (projectId: string) => {
    setSelectedProjectIds((prev) =>
      prev.includes(projectId) ? prev.filter((id) => id !== projectId) : [...prev, projectId]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Team Directory</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {members.length} member{members.length !== 1 ? 's' : ''} in this workspace
          </p>
        </div>
        <button
          onClick={() => setInviteModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-sm font-semibold rounded-lg transition-all shadow-sm"
        >
          <Plus size={15} />
          Invite Member
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((member) => (
          <div
            key={member.id}
            className="bg-white dark:bg-gray-900 border border-border rounded-xl p-5 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {member.profile.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={member.profile.avatarUrl}
                    alt={member.profile.fullName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 text-sm"
                    style={{ backgroundColor: member.profile.color }}
                  >
                    {member.profile.initials}
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-sm text-foreground">
                    {member.profile.fullName}
                  </h3>
                  <p className="text-xs text-muted-foreground">{member.profile.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {member.status === 'invited' && (
                  <span className="px-2 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-full">
                    Invited
                  </span>
                )}
                {member.status === 'active' && (
                  <span className="px-2 py-0.5 text-[10px] font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full">
                    Active
                  </span>
                )}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-lg font-semibold text-foreground">{member.activeProjectCount}</p>
                <p className="text-xs text-muted-foreground">Projects</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">{member.assignedTaskCount}</p>
                <p className="text-xs text-muted-foreground">Tasks</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">
                  {member.recentActivityCount}
                </p>
                <p className="text-xs text-muted-foreground">Activities</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Shield size={14} />
                Role:
                <select
                  value={member.role}
                  onChange={(e) => updateRole(member.id, e.target.value as WorkspaceRole)}
                  className="bg-transparent border-none p-0 ml-1 text-foreground font-medium focus:ring-0 cursor-pointer"
                >
                  <option value="owner">Owner</option>
                  <option value="admin">Admin</option>
                  <option value="member">Member</option>
                </select>
              </div>
              <button
                onClick={() => openProjectAssignment(member.id)}
                className="p-1.5 text-muted-foreground hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded-md transition-colors"
                title="Assign Projects"
              >
                <FolderKanban size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        title="Invite Team Member"
        subtitle="Send an email invitation to join this workspace."
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setInviteModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-foreground bg-muted rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit(handleInvite)}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 size={15} className="animate-spin" /> : 'Send Invite'}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email Address</label>
            <input
              type="email"
              {...register('email', { required: true })}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="colleague@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input
              type="text"
              {...register('fullName', { required: true })}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Jane Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <select
              {...register('role')}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
      </Modal>

      <Modal
        open={projectModalOpen}
        onClose={() => setProjectModalOpen(false)}
        title="Assign Projects"
        subtitle={`Select which projects ${selectedMember?.profile.fullName} should be part of.`}
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setProjectModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-foreground bg-muted rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleProjectSync}
              className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
            >
              Save Assignments
            </button>
          </div>
        }
      >
        <div className="space-y-2 max-h-96 overflow-y-auto pr-2 scrollbar-thin">
          {projects.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No projects found.</p>
          )}
          {projects.map((project) => (
            <label
              key={project.id}
              className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">{project.title}</span>
                <span className="text-xs text-muted-foreground">{project.status}</span>
              </div>
              <input
                type="checkbox"
                checked={selectedProjectIds.includes(project.id)}
                onChange={() => toggleProject(project.id)}
                className="w-4 h-4 rounded accent-indigo-600"
              />
            </label>
          ))}
        </div>
      </Modal>
    </div>
  );
}
