import { describe, expect, it } from 'vitest';
import { projectInputSchema, taskInputSchema, workspaceSettingsSchema } from '@/lib/validators';

describe('projectInputSchema', () => {
  it('fills optional arrays with safe defaults', () => {
    const parsed = projectInputSchema.parse({
      title: 'Launch workspace',
      description: 'Prepare the launch workspace for the staging environment.',
      status: 'Active',
      dueDate: '2026-05-01',
    });

    expect(parsed.teamIds).toEqual([]);
    expect(parsed.tags).toEqual([]);
  });
});

describe('taskInputSchema', () => {
  it('rejects malformed date strings', () => {
    expect(() =>
      taskInputSchema.parse({
        title: 'Broken task',
        description: '',
        projectId: '11111111-1111-1111-1111-111111111111',
        assigneeId: null,
        status: 'To-Do',
        priority: 'Medium',
        dueDate: '05/01/2026',
      })
    ).toThrow('Expected YYYY-MM-DD date');
  });
});

describe('workspaceSettingsSchema', () => {
  it('accepts a valid workspace settings payload', () => {
    const parsed = workspaceSettingsSchema.parse({
      name: 'FernFlow',
      logoUrl: null,
      timezone: 'Asia/Colombo',
      businessDays: [1, 2, 3, 4, 5],
      taskStatuses: ['To-Do', 'In Progress', 'Review', 'Done'],
      notificationDefaults: {
        email: true,
        inApp: true,
        dueSoon: true,
        overdue: true,
        taskAssigned: true,
        taskStatusChanged: true,
      },
    });

    expect(parsed.notificationDefaults.inApp).toBe(true);
  });
});
