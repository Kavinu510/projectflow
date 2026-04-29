import { NextResponse } from 'next/server';
import { hasSupabaseEnv } from '@/lib/env';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    checkedAt: new Date().toISOString(),
    environment:
      process.env.CI_ENVIRONMENT_NAME ??
      process.env.CONTEXT ??
      process.env.NETLIFY_CONTEXT ??
      process.env.NODE_ENV,
    commitSha: process.env.GITHUB_SHA ?? process.env.COMMIT_REF ?? null,
    services: {
      supabaseConfigured: hasSupabaseEnv(),
      protectedSmokeEnabled: process.env.CI_SMOKE_ENABLED === 'true',
    },
  });
}
