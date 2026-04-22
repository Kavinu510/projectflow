'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TASK_COMPLETION_TREND, TASKS_BY_PROJECT_DATA } from '@/lib/mockData';
import { TrendingUp, BarChart2 } from 'lucide-react';

// Backend integration point: replace with GET /api/analytics/task-trend?days=7

const CustomTooltipTrend = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-gray-800 border border-border rounded-lg shadow-card p-3 text-sm">
      <p className="font-semibold text-foreground mb-2">{label}</p>
      {payload.map((p) => (
        <div key={`tooltip-${p.name}`} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-muted-foreground capitalize">{p.name}:</span>
          <span className="font-semibold text-foreground tabular-nums">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

const CustomTooltipBar = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-gray-800 border border-border rounded-lg shadow-card p-3 text-sm">
      <p className="font-semibold text-foreground mb-2">{label}</p>
      {payload.map((p) => (
        <div key={`bar-tooltip-${p.name}`} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-muted-foreground capitalize">{p.name}:</span>
          <span className="font-semibold text-foreground tabular-nums">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function DashboardCharts() {
  return (
    <div className="space-y-6">
      {/* Task Completion Trend */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-border shadow-card p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600">
                <TrendingUp size={14} />
              </div>
              <h3 className="text-base font-semibold text-foreground">Task Completion Trend</h3>
            </div>
            <p className="text-sm text-muted-foreground">Tasks completed vs added — last 7 days</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="w-3 h-0.5 bg-indigo-500 inline-block rounded" />
              Completed
            </span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="w-3 h-0.5 bg-slate-300 inline-block rounded" />
              Added
            </span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart
            data={TASK_COMPLETION_TREND}
            margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgb(226 232 240)" vertical={false} />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 11, fill: 'rgb(100 116 139)', fontFamily: 'DM Sans' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'rgb(100 116 139)', fontFamily: 'DM Sans' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltipTrend />} />
            <Area
              type="monotone"
              dataKey="added"
              stroke="#94A3B8"
              strokeWidth={2}
              fill="url(#addedGradient)"
              dot={false}
              activeDot={{ r: 4, fill: '#94A3B8' }}
            />
            <Area
              type="monotone"
              dataKey="completed"
              stroke="#4F46E5"
              strokeWidth={2.5}
              fill="url(#completedGradient)"
              dot={false}
              activeDot={{ r: 5, fill: '#4F46E5', strokeWidth: 2, stroke: '#fff' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Tasks by Project */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-border shadow-card p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-950 flex items-center justify-center text-teal-600">
                <BarChart2 size={14} />
              </div>
              <h3 className="text-base font-semibold text-foreground">Tasks by Project</h3>
            </div>
            <p className="text-sm text-muted-foreground">Open vs completed tasks per project</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={TASKS_BY_PROJECT_DATA}
            margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
            barCategoryGap="35%"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgb(226 232 240)" vertical={false} />
            <XAxis
              dataKey="project"
              tick={{ fontSize: 11, fill: 'rgb(100 116 139)', fontFamily: 'DM Sans' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'rgb(100 116 139)', fontFamily: 'DM Sans' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltipBar />} />
            <Bar dataKey="open" name="Open" fill="#818CF8" radius={[3, 3, 0, 0]} />
            <Bar dataKey="done" name="Done" fill="#34D399" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-4 mt-3 text-xs justify-center">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="w-3 h-3 rounded-sm bg-indigo-400 inline-block" />
            Open
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="w-3 h-3 rounded-sm bg-emerald-400 inline-block" />
            Done
          </span>
        </div>
      </div>
    </div>
  );
}