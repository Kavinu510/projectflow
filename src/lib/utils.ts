import clsx, { type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function clampPercentage(value: number) {
  if (Number.isNaN(value)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(value)));
}

export function formatDate(dateStr: string, locale = 'en-US'): string {
  const date = new Date(dateStr);

  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function formatPageDate(date = new Date(), locale = 'en-US'): string {
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function formatRelativeTime(timestamp: string, now = new Date(), locale = 'en'): string {
  const date = new Date(timestamp);
  const diffSeconds = Math.round((date.getTime() - now.getTime()) / 1000);
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  const ranges: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ['year', 60 * 60 * 24 * 365],
    ['month', 60 * 60 * 24 * 30],
    ['week', 60 * 60 * 24 * 7],
    ['day', 60 * 60 * 24],
    ['hour', 60 * 60],
    ['minute', 60],
  ];

  for (const [unit, secondsInUnit] of ranges) {
    if (Math.abs(diffSeconds) >= secondsInUnit || unit === 'minute') {
      return formatter.format(Math.round(diffSeconds / secondsInUnit), unit);
    }
  }

  return formatter.format(diffSeconds, 'second');
}

export function toDateOnly(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function isOverdue(dueDate: string, now = new Date()) {
  return new Date(dueDate) < toDateOnly(now);
}

export function isDueToday(dueDate: string, now = new Date()) {
  return new Date(dueDate).toDateString() === toDateOnly(now).toDateString();
}

export function isDueSoon(dueDate: string, now = new Date(), days = 3) {
  const due = new Date(dueDate);
  const current = toDateOnly(now);
  const diffDays = Math.floor((due.getTime() - current.getTime()) / 86400000);

  return diffDays >= 0 && diffDays <= days;
}

export function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function avatarColorForString(input: string) {
  const palette = [
    '#4F46E5',
    '#0F766E',
    '#C2410C',
    '#BE185D',
    '#7C3AED',
    '#0F766E',
    '#2563EB',
    '#059669',
  ];

  const hash = input.split('').reduce((sum, character) => sum + character.charCodeAt(0), 0);
  return palette[hash % palette.length];
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function uniqueStrings(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}
