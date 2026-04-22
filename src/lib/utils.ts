import clsx, { type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return inputs.filter(Boolean).join(' ');
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatRelativeTime(timestamp: string): string {
  const now = new Date('2026-04-22T01:47:15Z');
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

export function isOverdue(dueDate: string): boolean {
  const now = new Date('2026-04-22');
  const due = new Date(dueDate);
  return due < now;
}

export function isDueToday(dueDate: string): boolean {
  return dueDate === '2026-04-22';
}

export function isDueSoon(dueDate: string): boolean {
  const now = new Date('2026-04-22');
  const due = new Date(dueDate);
  const diffDays = Math.floor((due.getTime() - now.getTime()) / 86400000);
  return diffDays >= 0 && diffDays <= 3;
}