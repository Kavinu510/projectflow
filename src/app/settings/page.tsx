import { redirect } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import SettingsClient from './components/SettingsClient';
import { getAppShellData } from '@/lib/server/app-context';
import { getSettingsPageData } from '@/lib/server/data';

export default async function SettingsPage() {
  const shell = await getAppShellData();

  if (!shell) {
    redirect('/login');
  }

  const data = await getSettingsPageData();

  // Admin/Owner check is already done inside getSettingsPageData()
  // but if it fails it might throw an error. Assuming it's handled.

  return (
    <AppLayout currentPath="/settings" shell={shell}>
      <SettingsClient initialData={data} />
    </AppLayout>
  );
}
