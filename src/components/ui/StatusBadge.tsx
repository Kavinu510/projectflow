import React from 'react';
import type { ProjectStatus, TaskPriority, TaskStatus } from '@/lib/types';

type BadgeVariant = TaskStatus | ProjectStatus | TaskPriority;

const BADGE_STYLES: Record<string, string> = {
  // Task status
  'To-Do': 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
  'In Progress': 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  Review: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  Done: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  // Project status
  Active: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
  Completed: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  'On Hold': 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  // Priority
  Low: 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400',
  Medium: 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300',
  High: 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-300',
};

const DOT_STYLES: Record<string, string> = {
  'To-Do': 'bg-slate-400',
  'In Progress': 'bg-blue-500',
  Review: 'bg-amber-500',
  Done: 'bg-emerald-500',
  Active: 'bg-indigo-500',
  Completed: 'bg-emerald-500',
  'On Hold': 'bg-amber-500',
  Low: 'bg-slate-400',
  Medium: 'bg-blue-500',
  High: 'bg-red-500',
};

interface StatusBadgeProps {
  variant: BadgeVariant;
  showDot?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export default function StatusBadge({
  variant,
  showDot = true,
  size = 'sm',
  className = '',
}: StatusBadgeProps) {
  const baseStyle = BADGE_STYLES[variant] ?? 'bg-slate-100 text-slate-600';
  const dotStyle = DOT_STYLES[variant] ?? 'bg-slate-400';

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 font-medium rounded-full whitespace-nowrap
        ${size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'}
        ${baseStyle}
        ${className}
      `}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotStyle}`} />}
      {variant}
    </span>
  );
}
