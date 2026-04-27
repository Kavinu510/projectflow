import { redirect } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import TaskListViewClient from './components/TaskListViewClient';
import { getAppShellData } from '@/lib/server/app-context';
import { getTasksPageData } from '@/lib/server/data';

export default async function TaskListViewPage() {
  const shell = await getAppShellData();

  if (!shell) {
    redirect('/login');
  }

  const data = await getTasksPageData();

  const users = data.members.map((member) => ({
    id: member.userId,
    name: member.profile.fullName,
    initials: member.profile.initials,
    color: member.profile.color,
    role: member.role,
    email: member.profile.email,
  }));

  return (
    <AppLayout currentPath="/task-list-view" shell={shell}>
      <TaskListViewClient initialTasks={data.tasks} projects={data.projects} users={users} />
    </AppLayout>
  );
}
