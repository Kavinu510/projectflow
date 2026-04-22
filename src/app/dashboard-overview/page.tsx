import React from 'react';
import AppLayout from '@/components/AppLayout';
import MetricsBentoGrid from './components/MetricsBentoGrid';
import DashboardCharts from './components/DashboardCharts';
import ActivityFeed from './components/ActivityFeed';
import TopProjectsPanel from './components/TopProjectsPanel';

export default function DashboardOverviewPage() {
  return (
    <AppLayout currentPath="/dashboard-overview">
      <div className="space-y-8">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Good morning, Priya 👋</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Here&apos;s what&apos;s happening across your projects today.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            Live · Last updated just now
          </div>
        </div>

        <MetricsBentoGrid />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <DashboardCharts />
          </div>
          <div className="xl:col-span-1">
            <ActivityFeed />
          </div>
        </div>

        <TopProjectsPanel />
      </div>
    </AppLayout>
  );
}