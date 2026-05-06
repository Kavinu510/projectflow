'use client';

import { FormEvent, useState } from 'react';
import { Loader2, Mail, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const supabase = createSupabaseBrowserClient();

  const handleGoogleSignIn = async () => {
    setSubmitting(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      toast.error(error.message);
      setSubmitting(false);
    }
  };

  const handleMagicLink = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      toast.error(error.message);
      setSubmitting(false);
      return;
    }

    toast.success('Magic link sent. Check your email to continue.');
    setSubmitting(false);
  };

  return (
    <div className="w-full max-w-md rounded-3xl border border-border bg-white/90 p-8 shadow-card backdrop-blur dark:bg-slate-900/90">
      <div className="mb-8">
        <div className="mb-4 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
          Internal Workspace Access
        </div>
        <h1 className="text-3xl font-semibold text-foreground">Sign in to FernFlow</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage projects, tasks, team collaboration, notifications, and workspace settings from one
          place.
        </p>
      </div>

      <div className="space-y-4">
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-70 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
        >
          {submitting ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
          Continue with Google
        </button>

        <div className="flex items-center gap-3 text-xs uppercase tracking-[0.24em] text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          or
          <span className="h-px flex-1 bg-border" />
        </div>

        <form className="space-y-3" onSubmit={handleMagicLink}>
          <label className="block text-sm font-medium text-foreground" htmlFor="email">
            Work email
          </label>
          <div className="relative">
            <Mail
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@fernflow.app"
              required
              className="w-full rounded-xl border border-input bg-background py-3 pl-10 pr-4 text-sm text-foreground outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-slate-50 disabled:opacity-70 dark:bg-slate-950 dark:hover:bg-slate-900"
          >
            {submitting ? 'Sending link...' : 'Send magic link'}
          </button>
        </form>
      </div>
    </div>
  );
}
