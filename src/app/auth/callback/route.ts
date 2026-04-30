import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';
import { buildAuthCompleteUrl, getSafeRedirectPath } from '@/lib/auth/redirect';
import { getPublicEnv } from '@/lib/env';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const next = getSafeRedirectPath(url.searchParams.get('next'));
  const redirectResponse = NextResponse.redirect(buildAuthCompleteUrl(url.origin, next));

  if (!code) {
    return redirectResponse;
  }

  const env = getPublicEnv();
  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          cookiesToSet.forEach(({ name, value, options }) =>
            redirectResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error('Auth callback error:', error.message);
    return NextResponse.redirect(new URL('/login?error=auth-callback-failed', url.origin));
  }

  return redirectResponse;
}
