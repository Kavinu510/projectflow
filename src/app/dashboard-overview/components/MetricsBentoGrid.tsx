'use client';

import React from 'react';
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Clock,
  FolderKanban,
  Minus,
  ShieldAlert,
  TrendingUp,
  Users,
} from 'lucide-react';
import { type DashboardMetrics } from '@/lib/types';

export default function MetricsBentoGrid({ metrics }: { metrics: DashboardMetrics }) {
  const cards = [
    {
      id: 'active-projects',
      label: 'Active Projects',
      value: metrics.activeProjects,
      unit: '',
      icon: <FolderKanban size={20} />,
      trend: { direction: 'up' as const, label: 'Workspace momentum is healthy' },
      colorClass: 'text-indigo-600',
      bgClass: 'bg-indigo-50 dark:bg-indigo-950',
    },
    {
      id: 'due-today',
      label: 'Due Today',
      value: metrics.dueTodayTasks,
      unit: 'tasks',
      icon: <Clock size={20} />,
      trend: { direction: 'neutral' as const, label: 'Keep an eye on deadlines' },
      colorClass: 'text-amber-600',
      bgClass: 'bg-amber-50 dark:bg-amber-950',
    },
    {
      id: 'overdue',
      label: 'Overdue Tasks',
      value: metrics.overdueTasks,
      unit: 'tasks',
      icon: <AlertCircle size={20} />,
      trend: { direction: 'down' as const, label: 'Needs intervention' },
      colorClass: 'text-red-600',
      bgClass: 'bg-red-50 dark:bg-red-950',
      isAlert: true,
    },
    {
      id: 'team',
      label: 'Team Members',
      value: metrics.teamCount,
      unit: 'active',
      icon: <Users size={20} />,
      trend: { direction: 'up' as const, label: 'Collaborating in one workspace' },
      colorClass: 'text-teal-600',
      bgClass: 'bg-teal-50 dark:bg-teal-950',
    },
    {
      id: 'completion',
      label: '7-Day Completion',
      value: metrics.completionRate,
      unit: '%',
      icon: <TrendingUp size={20} />,
      trend: {
        direction: (metrics.completionRate >= 60 ? 'up' : 'neutral') as 'up' | 'neutral' | 'down',
        label: `${metrics.completedLast7Days} completed, ${metrics.createdLast7Days} created`,
      },
      colorClass: 'text-emerald-600',
      bgClass: 'bg-emerald-50 dark:bg-emerald-950',
    },
    {
      id: 'review',
      label: 'In Review',
      value: metrics.reviewTasks,
      unit: 'tasks',
      icon: <ShieldAlert size={20} />,
      trend: { direction: 'neutral' as const, label: 'Awaiting review or approval' },
      colorClass: 'text-violet-600',
      bgClass: 'bg-violet-50 dark:bg-violet-950',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
      {cards.map((card) => (
        <MetricCard key={card.id} metric={card} />
      ))}
    </div>
  );
}

function MetricCard({
  metric,
}: {
  metric: {
    id: string;
    label: string;
    value: number;
    unit: string;
    icon: React.ReactNode;
    trend: { direction: 'up' | 'down' | 'neutral'; label: string };
    colorClass: string;
    bgClass: string;
    isAlert?: boolean;
  };
}) {
  const TrendIcon =
    metric.trend.direction === 'up'
      ? ArrowUp
      : metric.trend.direction === 'down'
        ? ArrowDown
        : Minus;

  const trendColor =
    metric.trend.direction === 'up'
      ? 'text-emerald-500'
      : metric.trend.direction === 'down'
        ? 'text-red-500'
        : 'text-muted-foreground';

  return (
    <div
      className={`rounded-xl border border-border bg-white p-5 shadow-card transition hover:shadow-card-hover dark:bg-slate-900 ${
        metric.isAlert ? 'ring-1 ring-red-200 dark:ring-red-900' : ''
      }`}
    >
      <div className="mb-4 flex items-start justify-between">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${metric.bgClass} ${metric.colorClass}`}
        >
          {metric.icon}
        </div>
        {metric.isAlert && (
          <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600 dark:bg-red-950">
            Alert
          </span>
        )}
      </div>

      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
        {metric.label}
      </p>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="text-3xl font-bold text-foreground">{metric.value}</span>
        {metric.unit && <span className="text-sm text-muted-foreground">{metric.unit}</span>}
      </div>

      <div className={`mt-3 flex items-center gap-1 text-xs font-medium ${trendColor}`}>
        <TrendIcon size={12} />
        <span>{metric.trend.label}</span>
      </div>
    </div>
  );
}
