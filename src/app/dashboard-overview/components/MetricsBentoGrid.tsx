'use client';

import React from 'react';
import {
  FolderKanban,
  Clock,
  AlertCircle,
  Users,
  TrendingUp,
  ShieldAlert,
  ArrowUp,
  ArrowDown,
  Minus,
} from 'lucide-react';
import { PROJECTS, TASKS, USERS } from '@/lib/mockData';
import { isOverdue, isDueToday } from '@/lib/utils';

export default function MetricsBentoGrid() {
  // Backend integration point: replace with API call to GET /api/dashboard/metrics
  const activeProjects = PROJECTS.filter((p) => p.status === 'Active').length;
  const dueTodayTasks = TASKS.filter((t) => isDueToday(t.dueDate) && t.status !== 'Done').length;
  const overdueTasks = TASKS.filter((t) => isOverdue(t.dueDate) && t.status !== 'Done').length;
  const teamCount = USERS.length;
  const doneLast7 = 45; // mock: tasks completed in last 7 days
  const totalLast7 = 68;
  const completionRate = Math.round((doneLast7 / totalLast7) * 100);
  const blockedTasks = TASKS.filter((t) => t.status === 'Review').length;

  // Grid plan: 6 cards → grid-cols-3 × 2 rows
  // Row 1: hero (Active Projects, spans 1 col wide but taller) + Due Today + Overdue (alert)
  // Row 2: Team Members + Completion Rate + Blocked Tasks
  // Actually: 6 cards → 3-col × 2 rows, with first card slightly larger

  const metrics = [
    {
      id: 'metric-active-projects',
      label: 'Active Projects',
      value: activeProjects,
      unit: '',
      icon: <FolderKanban size={20} />,
      trend: { direction: 'up' as const, label: '+2 this month' },
      colorClass: 'text-indigo-600',
      bgClass: 'bg-indigo-50 dark:bg-indigo-950',
      isHero: true,
    },
    {
      id: 'metric-due-today',
      label: 'Due Today',
      value: dueTodayTasks,
      unit: 'tasks',
      icon: <Clock size={20} />,
      trend: { direction: 'neutral' as const, label: 'Check deadlines' },
      colorClass: 'text-amber-600',
      bgClass: 'bg-amber-50 dark:bg-amber-950',
      isHero: false,
    },
    {
      id: 'metric-overdue',
      label: 'Overdue Tasks',
      value: overdueTasks,
      unit: 'tasks',
      icon: <AlertCircle size={20} />,
      trend: { direction: 'down' as const, label: 'Needs attention' },
      colorClass: 'text-red-600',
      bgClass: 'bg-red-50 dark:bg-red-950',
      isAlert: true,
      isHero: false,
    },
    {
      id: 'metric-team',
      label: 'Team Members',
      value: teamCount,
      unit: 'active',
      icon: <Users size={20} />,
      trend: { direction: 'up' as const, label: '1 joined this week' },
      colorClass: 'text-teal-600',
      bgClass: 'bg-teal-50 dark:bg-teal-950',
      isHero: false,
    },
    {
      id: 'metric-completion',
      label: '7-Day Completion',
      value: completionRate,
      unit: '%',
      icon: <TrendingUp size={20} />,
      trend: { direction: 'up' as const, label: `${doneLast7} of ${totalLast7} tasks` },
      colorClass: 'text-emerald-600',
      bgClass: 'bg-emerald-50 dark:bg-emerald-950',
      isHero: false,
    },
    {
      id: 'metric-blocked',
      label: 'In Review',
      value: blockedTasks,
      unit: 'tasks',
      icon: <ShieldAlert size={20} />,
      trend: { direction: 'neutral' as const, label: 'Awaiting review' },
      colorClass: 'text-violet-600',
      bgClass: 'bg-violet-50 dark:bg-violet-950',
      isHero: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-6 gap-4">
      {metrics.map((m) => (
        <MetricCard key={m.id} metric={m} />
      ))}
    </div>
  );
}

interface Metric {
  id: string;
  label: string;
  value: number;
  unit: string;
  icon: React.ReactNode;
  trend: { direction: 'up' | 'down' | 'neutral'; label: string };
  colorClass: string;
  bgClass: string;
  isAlert?: boolean;
  isHero?: boolean;
}

function MetricCard({ metric }: { metric: Metric }) {
  const TrendIcon =
    metric.trend.direction === 'up'
      ? ArrowUp
      : metric.trend.direction === 'down'
      ? ArrowDown
      : Minus;

  const trendColor =
    metric.id === 'metric-overdue'
      ? metric.trend.direction === 'down' ?'text-red-500' :'text-red-500'
      : metric.trend.direction === 'up' ?'text-emerald-500'
      : metric.trend.direction === 'down' ?'text-red-500' :'text-muted-foreground';

  return (
    <div
      className={`
        bg-white dark:bg-gray-900 rounded-xl border border-border shadow-card
        p-5 hover:shadow-card-hover transition-shadow duration-200
        ${metric.isAlert ? 'ring-1 ring-red-200 dark:ring-red-900' : ''}
      `}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-lg ${metric.bgClass} flex items-center justify-center ${metric.colorClass}`}>
          {metric.icon}
        </div>
        {metric.isAlert && (
          <span className="text-xs font-semibold text-red-600 bg-red-50 dark:bg-red-950 px-2 py-0.5 rounded-full">
            Alert
          </span>
        )}
      </div>

      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {metric.label}
        </p>
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-bold text-foreground tabular-nums">{metric.value}</span>
          {metric.unit && (
            <span className="text-sm text-muted-foreground font-medium">{metric.unit}</span>
          )}
        </div>
      </div>

      <div className={`flex items-center gap-1 mt-3 text-xs font-medium ${trendColor}`}>
        <TrendIcon size={12} />
        <span>{metric.trend.label}</span>
      </div>
    </div>
  );
}