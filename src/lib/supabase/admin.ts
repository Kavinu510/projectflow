import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getServerEnv } from '@/lib/env';

let adminClient: SupabaseClient<any, 'public', any> | null = null;

export function createSupabaseAdminClient(): SupabaseClient<any, 'public', any> {
  if (adminClient) {
    return adminClient;
  }

  const env = getServerEnv();

  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for FernFlow server operations.');
  }

  adminClient = createClient<any, any, any>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  return adminClient;
}
