import { afterEach, describe, expect, it, vi } from 'vitest';

const ORIGINAL_ENV = { ...process.env };

function resetEnv() {
  process.env = { ...ORIGINAL_ENV };
}

afterEach(() => {
  resetEnv();
  vi.resetModules();
});

describe('env helpers', () => {
  it('parses the required public environment variables', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
    process.env.NEXT_PUBLIC_SITE_URL = 'https://fernflow.example.com';

    const { getPublicEnv } = await import('@/lib/env');
    const env = getPublicEnv();

    expect(env.NEXT_PUBLIC_SUPABASE_URL).toBe('https://example.supabase.co');
    expect(env.NEXT_PUBLIC_SITE_URL).toBe('https://fernflow.example.com');
  });

  it('applies server defaults for workspace metadata', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';

    const { getServerEnv } = await import('@/lib/env');
    const env = getServerEnv();

    expect(env.FERNFLOW_WORKSPACE_NAME).toBe('FernFlow');
    expect(env.FERNFLOW_WORKSPACE_SLUG).toBe('fernflow');
  });

  it('treats blank optional server env values as unset', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
    process.env.NEXT_PUBLIC_SITE_URL = '   ';
    process.env.SUPABASE_SERVICE_ROLE_KEY = '';
    process.env.FERNFLOW_WORKSPACE_NAME = '   ';
    process.env.FERNFLOW_WORKSPACE_SLUG = '';
    process.env.FERNFLOW_OWNER_EMAIL = ' ';

    const { getServerEnv } = await import('@/lib/env');
    const env = getServerEnv();

    expect(env.NEXT_PUBLIC_SITE_URL).toBeUndefined();
    expect(env.SUPABASE_SERVICE_ROLE_KEY).toBeUndefined();
    expect(env.FERNFLOW_OWNER_EMAIL).toBeUndefined();
    expect(env.FERNFLOW_WORKSPACE_NAME).toBe('FernFlow');
    expect(env.FERNFLOW_WORKSPACE_SLUG).toBe('fernflow');
  });

  it('throws when the public Supabase URL is invalid', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'not-a-url';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';

    const { getPublicEnv } = await import('@/lib/env');

    expect(() => getPublicEnv()).toThrow();
  });
});
