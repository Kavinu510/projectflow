import { redirect } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import ProfileClient from './components/ProfileClient';
import { getAppShellData } from '@/lib/server/app-context';
import { getProfilePageData } from '@/lib/server/data';

export default async function ProfilePage() {
  const shell = await getAppShellData();

  if (!shell) {
    redirect('/login');
  }

  const data = await getProfilePageData();

  return (
    <AppLayout currentPath="/profile" shell={shell}>
      <ProfileClient initialData={data} />
    </AppLayout>
  );
}
