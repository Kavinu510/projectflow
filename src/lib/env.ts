import { z } from 'zod';

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
});

const serverEnvSchema = publicEnvSchema.extend({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  FERNFLOW_WORKSPACE_NAME: z.string().default('FernFlow'),
  FERNFLOW_WORKSPACE_SLUG: z.string().default('fernflow'),
  FERNFLOW_OWNER_EMAIL: z.string().email().optional(),
});

let publicEnvCache: z.infer<typeof publicEnvSchema> | null = null;
let serverEnvCache: z.infer<typeof serverEnvSchema> | null = null;

export function hasSupabaseEnv() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function getPublicEnv() {
  if (!publicEnvCache) {
    publicEnvCache = publicEnvSchema.parse({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    });
  }

  return publicEnvCache;
}

export function getServerEnv() {
  if (!serverEnvCache) {
    serverEnvCache = serverEnvSchema.parse({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      FERNFLOW_WORKSPACE_NAME: process.env.FERNFLOW_WORKSPACE_NAME,
      FERNFLOW_WORKSPACE_SLUG: process.env.FERNFLOW_WORKSPACE_SLUG,
      FERNFLOW_OWNER_EMAIL: process.env.FERNFLOW_OWNER_EMAIL,
    });
  }

  return serverEnvCache;
}
