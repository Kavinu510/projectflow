import AuthCompleteClient from '@/app/auth/complete/AuthCompleteClient';
import { getSafeRedirectPath } from '@/lib/auth/redirect';

type AuthCompletePageProps = {
  searchParams?: Promise<{
    next?: string | string[];
  }>;
};

export default async function AuthCompletePage({ searchParams }: AuthCompletePageProps) {
  const params = await searchParams;
  const nextPath = getSafeRedirectPath(params?.next);

  return <AuthCompleteClient nextPath={nextPath} />;
}
