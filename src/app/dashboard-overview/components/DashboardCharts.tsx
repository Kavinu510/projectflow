'use client';

import React from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { BarChart2, TrendingUp } from 'lucide-react';

interface DashboardChartsProps {
  trendData: Array<{ day: string; completed: number; added: number }>;
  tasksByProjectData: Array<{ project: string; open: number; done: number }>;
}

function TooltipCard({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-lg border border-border bg-white p-3 text-sm shadow-card dark:bg-slate-900">
      <p className="mb-2 font-semibold text-foreground">{label}</p>
      {payload.map((item) => (
        <div key={`${label}-${item.name}`} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
          <span className="capitalize text-muted-foreground">{item.name}:</span>
          <span className="font-semibold text-foreground">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function DashboardCharts({ trendData, tasksByProjectData }: DashboardChartsProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-white p-6 shadow-card dark:bg-slate-900">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950">
                <TrendingUp size={14} />
              </div>
              <h3 className="text-base font-semibold text-foreground">Task Completion Trend</h3>
            </div>
            <p className="text-sm text-muted-foreground">Completed vs added over the last 7 days</p>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="addedGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="#94A3B8" stopOpacity={0.24} />
                <stop offset="95%" stopColor="#94A3B8" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="completedGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.28} />
                <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgb(226 232 240)" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="day"
              axisLine={false}
              tick={{ fontSize: 11, fill: 'rgb(100 116 139)', fontFamily: 'DM Sans' }}
              tickLine={false}
            />
            <YAxis
              axisLine={false}
              tick={{ fontSize: 11, fill: 'rgb(100 116 139)', fontFamily: 'DM Sans' }}
              tickLine={false}
            />
            <Tooltip content={<TooltipCard />} />
            <Area dataKey="added" dot={false} fill="url(#addedGradient)" stroke="#94A3B8" />
            <Area
              dataKey="completed"
              dot={false}
              fill="url(#completedGradient)"
              stroke="#4F46E5"
              strokeWidth={2.5}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-xl border border-border bg-white p-6 shadow-card dark:bg-slate-900">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-950">
                <BarChart2 size={14} />
              </div>
              <h3 className="text-base font-semibold text-foreground">Tasks by Project</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Open vs done tasks across current projects
            </p>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={tasksByProjectData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid stroke="rgb(226 232 240)" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="project"
              axisLine={false}
              tick={{ fontSize: 11, fill: 'rgb(100 116 139)', fontFamily: 'DM Sans' }}
              tickLine={false}
            />
            <YAxis
              axisLine={false}
              tick={{ fontSize: 11, fill: 'rgb(100 116 139)', fontFamily: 'DM Sans' }}
              tickLine={false}
            />
            <Tooltip content={<TooltipCard />} />
            <Bar dataKey="open" fill="#818CF8" name="Open" radius={[4, 4, 0, 0]} />
            <Bar dataKey="done" fill="#34D399" name="Done" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
