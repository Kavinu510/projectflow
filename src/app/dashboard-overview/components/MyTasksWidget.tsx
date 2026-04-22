'use client';

import React from 'react';
import { TASKS } from '@/lib/mockData';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatDate, isOverdue, isDueToday } from '@/lib/utils';
import { CheckCircle2 } from 'lucide-react';

// Backend integration point: replace with GET /api/tasks?assigneeId=currentUserId&status=!Done

export default function MyTasksWidget() {
  // Simulate "current user" as Priya (user-001)
  const myTasks = TASKS?.filter(
    (t) => t?.assigneeId === 'user-001' && t?.status !== 'Done'
  )?.slice(0, 5);

  if (myTasks?.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-border shadow-card p-6 text-center">
        <CheckCircle2 size={32} className="text-emerald-500 mx-auto mb-2" />
        <p className="text-sm font-semibold text-foreground">All caught up!</p>
        <p className="text-xs text-muted-foreground mt-1">No open tasks assigned to you.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-border shadow-card">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <h3 className="text-base font-semibold text-foreground">My Tasks</h3>
        <span className="text-xs font-semibold tabular-nums text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
          {myTasks?.length}
        </span>
      </div>
      <div className="divide-y divide-border">
        {myTasks?.map((task) => {
          const overdue = isOverdue(task?.dueDate);
          const dueToday = isDueToday(task?.dueDate);
          return (
            <div
              key={`my-task-${task?.id}`}
              className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{task?.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <StatusBadge variant={task?.status} size="sm" />
                  <span
                    className={`text-xs tabular-nums ${
                      overdue
                        ? 'text-red-600 font-semibold'
                        : dueToday
                        ? 'text-amber-600 font-semibold' :'text-muted-foreground'
                    }`}
                  >
                    {overdue ? 'Overdue · ' : dueToday ? 'Due today · ' : ''}
                    {formatDate(task?.dueDate)}
                  </span>
                </div>
              </div>
              <StatusBadge variant={task?.priority} size="sm" showDot={false} />
            </div>
          );
        })}
      </div>
    </div>
  );
}