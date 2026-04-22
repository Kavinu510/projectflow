import React from 'react';

interface ProgressBarProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  size?: 'xs' | 'sm' | 'md';
  colorClass?: string;
  className?: string;
}

export default function ProgressBar({
  value,
  max = 100,
  showLabel = false,
  size = 'sm',
  colorClass,
  className = '',
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  const heightClass = {
    xs: 'h-1',
    sm: 'h-1.5',
    md: 'h-2.5',
  }[size];

  const autoColor =
    pct >= 80
      ? 'bg-emerald-500'
      : pct >= 50
      ? 'bg-indigo-500'
      : pct >= 25
      ? 'bg-amber-500' :'bg-red-500';

  const fillColor = colorClass ?? autoColor;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`flex-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden ${heightClass}`}>
        <div
          className={`${heightClass} ${fillColor} rounded-full transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-muted-foreground tabular-nums w-8 text-right">
          {Math.round(pct)}%
        </span>
      )}
    </div>
  );
}