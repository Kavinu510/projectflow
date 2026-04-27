import { redirect } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import NotificationsClient from './components/NotificationsClient';
import { getAppShellData } from '@/lib/server/app-context';
import { getNotificationsData } from '@/lib/server/data';

export default async function NotificationsPage() {
  const shell = await getAppShellData();

  if (!shell) {
    redirect('/login');
  }

  const data = await getNotificationsData();

  return (
    <AppLayout currentPath="/notifications" shell={shell}>
      <NotificationsClient initialData={data} />
    </AppLayout>
  );
}
