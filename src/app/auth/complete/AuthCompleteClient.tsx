'use client';

import { useEffect } from 'react';

type AuthCompleteClientProps = {
  nextPath: string;
};

export default function AuthCompleteClient({ nextPath }: AuthCompleteClientProps) {
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      window.location.replace(nextPath);
    }, 50);

    return () => window.clearTimeout(timeout);
  }, [nextPath]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-slate-900 dark:bg-slate-950 dark:text-white">
      <div className="text-center">
        <div className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600 dark:border-slate-700 dark:border-t-indigo-400" />
        <h1 className="text-lg font-semibold">Signing you in...</h1>
      </div>
    </main>
  );
}
