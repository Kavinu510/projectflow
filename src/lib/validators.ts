import { z } from 'zod';
import {
  PROJECT_STATUS_OPTIONS,
  TASK_PRIORITY_OPTIONS,
  TASK_STATUS_OPTIONS,
  WORKSPACE_ROLE_OPTIONS,
} from '@/lib/types';

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD date');

export const projectInputSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().min(10).max(2000),
  status: z.enum(PROJECT_STATUS_OPTIONS),
  dueDate: dateString,
  teamIds: z.array(z.string().uuid()).default([]),
  tags: z.array(z.string().min(1).max(32)).default([]),
});

export const taskInputSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().max(2000).default(''),
  projectId: z.string().uuid(),
  assigneeId: z.string().uuid().nullable(),
  status: z.enum(TASK_STATUS_OPTIONS),
  priority: z.enum(TASK_PRIORITY_OPTIONS),
  dueDate: dateString,
});

export const teamInviteSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2).max(120),
  role: z.enum(WORKSPACE_ROLE_OPTIONS),
  title: z.string().max(120).optional(),
});

export const teamMemberUpdateSchema = z.object({
  role: z.enum(WORKSPACE_ROLE_OPTIONS).optional(),
  status: z.enum(['active', 'inactive', 'invited']).optional(),
  projectIds: z.array(z.string().uuid()).optional(),
});

export const profileUpdateSchema = z.object({
  fullName: z.string().min(2).max(120),
  title: z.string().max(120),
  avatarUrl: z.string().url().nullable(),
  timezone: z.string().min(2).max(80),
  theme: z.enum(['light', 'dark', 'system']),
  emailNotifications: z.boolean(),
  inAppNotifications: z.boolean(),
  dailyDigest: z.boolean(),
});

export const workspaceSettingsSchema = z.object({
  name: z.string().min(2).max(120),
  logoUrl: z.string().url().nullable(),
  timezone: z.string().min(2).max(80),
  businessDays: z.array(z.number().int().min(0).max(6)).min(1).max(7),
  taskStatuses: z.array(z.enum(TASK_STATUS_OPTIONS)).min(1).max(4),
  notificationDefaults: z.object({
    email: z.boolean(),
    inApp: z.boolean(),
    dueSoon: z.boolean(),
    overdue: z.boolean(),
    taskAssigned: z.boolean(),
    taskStatusChanged: z.boolean(),
  }),
});

export const notificationUpdateSchema = z.object({
  isRead: z.boolean(),
});
