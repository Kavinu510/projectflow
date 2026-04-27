import { redirect } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import ProjectManagementClient from '@/app/project-management/components/ProjectManagementClient';
import { getAppShellData } from '@/lib/server/app-context';
import { getProjectsPageData } from '@/lib/server/data';

export default async function ProjectManagementPage() {
  const shell = await getAppShellData();

  if (!shell) {
    redirect('/login');
  }

  const data = await getProjectsPageData();

  const users = data.members.map((member) => ({
    id: member.userId,
    name: member.profile.fullName,
    initials: member.profile.initials,
    color: member.profile.color,
    role: member.role,
    email: member.profile.email,
  }));

  return (
    <AppLayout
      currentPath="/project-management"
      shell={shell}
      pageTitle="Projects"
      pageSubtitle={`${data.projects.length} projects · ${
        data.projects.filter((project) => project.status === 'Active').length
      } active`}
    >
      <ProjectManagementClient
        initialProjects={data.projects}
        initialTasks={data.tasks}
        users={users}
      />
    </AppLayout>
  );
}
