import { redirect } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import ActivityFeed from '@/app/dashboard-overview/components/ActivityFeed';
import DashboardCharts from '@/app/dashboard-overview/components/DashboardCharts';
import MetricsBentoGrid from '@/app/dashboard-overview/components/MetricsBentoGrid';
import MyTasksWidget from '@/app/dashboard-overview/components/MyTasksWidget';
import TopProjectsPanel from '@/app/dashboard-overview/components/TopProjectsPanel';
import { getAppShellData } from '@/lib/server/app-context';
import { getDashboardPageData } from '@/lib/server/data';
import { formatPageDate } from '@/lib/utils';

export default async function DashboardOverviewPage() {
  const shell = await getAppShellData();

  if (!shell) {
    redirect('/login');
  }

  const dashboard = await getDashboardPageData();

  return (
    <AppLayout
      currentPath="/dashboard-overview"
      shell={shell}
      pageTitle="Dashboard"
      pageSubtitle={formatPageDate()}
    >
      <div className="space-y-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">
              Welcome back, {shell.currentUser.fullName.split(' ')[0]}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Here&apos;s the real-time view of work happening across FernFlow today.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-xl bg-muted px-3 py-1.5 text-xs text-muted-foreground">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
            Live workspace data
          </div>
        </div>

        <MetricsBentoGrid metrics={dashboard.metrics} />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            <DashboardCharts
              tasksByProjectData={dashboard.tasksByProjectData}
              trendData={dashboard.trendData}
            />
            <TopProjectsPanel members={dashboard.members} projects={dashboard.topProjects} />
          </div>

          <div className="space-y-6 xl:col-span-1">
            <MyTasksWidget tasks={dashboard.myTasks} />
            <ActivityFeed activity={dashboard.activity} members={dashboard.members} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
