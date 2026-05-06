'use client';

import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

type AuthCompleteClientProps = {
  nextPath: string;
};

export default function AuthCompleteClient({ nextPath }: AuthCompleteClientProps) {
  const [isVerifying, setIsVerifying] = useState(true);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    const verifySession = async () => {
      try {
        // Wait a moment for session to be established
        await new Promise((resolve) => setTimeout(resolve, 100));

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error('Session verification error:', error);
          window.location.replace('/login?error=session-verification-failed');
          return;
        }

        if (!session) {
          window.location.replace('/login?error=no-session');
          return;
        }

        setIsVerifying(false);

        // Redirect to next path
        const timeout = setTimeout(() => {
          window.location.replace(nextPath);
        }, 200);

        return () => clearTimeout(timeout);
      } catch (error) {
        console.error('Auth completion error:', error);
        window.location.replace('/login?error=auth-completion-failed');
      }
    };

    verifySession();
  }, [nextPath, supabase]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-slate-900 dark:bg-slate-950 dark:text-white">
      <div className="text-center">
        <div className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600 dark:border-slate-700 dark:border-t-indigo-400" />
        <h1 className="text-lg font-semibold">
          {isVerifying ? 'Verifying session...' : 'Signing you in...'}
        </h1>
      </div>
    </main>
  );
}
