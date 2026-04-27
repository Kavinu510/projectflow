'use client';

import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatDate, isDueToday, isOverdue } from '@/lib/utils';
import { type Task } from '@/lib/types';

export default function MyTasksWidget({ tasks }: { tasks: Task[] }) {
  if (tasks.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-white p-6 text-center shadow-card dark:bg-slate-900">
        <CheckCircle2 size={32} className="mx-auto mb-2 text-emerald-500" />
        <p className="text-sm font-semibold text-foreground">All caught up</p>
        <p className="mt-1 text-xs text-muted-foreground">No open tasks are assigned to you.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-white shadow-card dark:bg-slate-900">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h3 className="text-base font-semibold text-foreground">My Tasks</h3>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
          {tasks.length}
        </span>
      </div>

      <div className="divide-y divide-border">
        {tasks.map((task) => {
          const overdue = isOverdue(task.dueDate);
          const dueToday = isDueToday(task.dueDate);

          return (
            <div
              key={task.id}
              className="flex items-center gap-3 px-5 py-3.5 transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{task.title}</p>
                <div className="mt-0.5 flex items-center gap-2">
                  <StatusBadge variant={task.status} size="sm" />
                  <span
                    className={`text-xs ${
                      overdue
                        ? 'font-semibold text-red-600'
                        : dueToday
                          ? 'font-semibold text-amber-600'
                          : 'text-muted-foreground'
                    }`}
                  >
                    {overdue ? 'Overdue · ' : dueToday ? 'Due today · ' : ''}
                    {formatDate(task.dueDate)}
                  </span>
                </div>
              </div>
              <StatusBadge variant={task.priority} size="sm" showDot={false} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
