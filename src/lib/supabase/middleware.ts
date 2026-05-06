import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';
import { hasSupabaseEnv } from '@/lib/env';

export async function updateSupabaseSession(request: NextRequest) {
  if (!hasSupabaseEnv()) {
    return NextResponse.next({ request });
  }

  const { pathname } = request.nextUrl;
  const isAuthRoute =
    pathname.startsWith('/auth/callback') || pathname.startsWith('/auth/complete');
  const isPublicRoute = pathname === '/login';
  const isAssetRoute = pathname.startsWith('/_next') || pathname.startsWith('/favicon.ico');

  if (isAuthRoute || isPublicRoute || isAssetRoute) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Keep middleware checks minimal to avoid auth-route/session verification loops.
  try {
    const { error } = await supabase.auth.getSession();
    if (error) {
      console.error('Middleware session error:', error);
    }
  } catch (error) {
    console.error('Middleware auth error:', error);
  }

  return response;
}
