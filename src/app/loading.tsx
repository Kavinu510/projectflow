import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="flex flex-col items-center justify-center text-center animate-pulse">
        <Loader2 className="animate-spin text-indigo-600 dark:text-indigo-400 mb-4" size={40} />
        <h2 className="text-lg font-semibold text-foreground">Loading FernFlow...</h2>
      </div>
    </div>
  );
}
