import { redirect } from 'next/navigation';
import LoginForm from '@/components/auth/LoginForm';
import { getCurrentAuthUser } from '@/lib/server/app-context';

export default async function LoginPage() {
  const user = await getCurrentAuthUser();

  if (user) {
    redirect('/dashboard-overview');
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.18),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(79,70,229,0.18),_transparent_30%),linear-gradient(135deg,_#f8fafc,_#ecfeff)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.12),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(79,70,229,0.16),_transparent_30%),linear-gradient(135deg,_#020617,_#111827)]">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center gap-12 px-6 py-12 lg:flex-row lg:items-start lg:justify-between">
        <section className="max-w-xl pt-12 text-center lg:pt-24 lg:text-left">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">
            FernFlow Internal Launch
          </p>
          <h2 className="mt-4 text-5xl font-semibold tracking-tight text-slate-900 dark:text-white">
            One workspace for projects, tasks, team visibility, and action-ready updates.
          </h2>
          <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-300">
            This first release is optimized for your startup team: persistent data, real
            notifications, and admin controls without the weight of a public multi-tenant SaaS
            build.
          </p>
        </section>

        <LoginForm />
      </div>
    </main>
  );
}
