import { redirect } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import TeamClient from './components/TeamClient';
import { getAppShellData } from '@/lib/server/app-context';
import { getTeamPageData } from '@/lib/server/data';

export default async function TeamPage() {
  const shell = await getAppShellData();

  if (!shell) {
    redirect('/login');
  }

  const data = await getTeamPageData();

  return (
    <AppLayout currentPath="/team" shell={shell}>
      <TeamClient initialData={data} />
    </AppLayout>
  );
}
