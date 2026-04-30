const GROUPS = {
  build: [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'FERNFLOW_WORKSPACE_SLUG',
    'FERNFLOW_WORKSPACE_NAME',
  ],
  netlify: ['NETLIFY_AUTH_TOKEN', 'NETLIFY_SITE_ID'],
  privateSmoke: ['CI_SMOKE_TOKEN'],
  smoke: ['SMOKE_BASE_URL'],
  supabase: ['SUPABASE_ACCESS_TOKEN', 'SUPABASE_PROJECT_ID', 'SUPABASE_DB_PASSWORD'],
};

function hasValue(value) {
  return typeof value === 'string' ? value.trim().length > 0 : Boolean(value);
}

const groups = process.argv.slice(2);

if (groups.length === 0) {
  console.error(
    `Usage: node scripts/ci/assert-required-env.mjs <${Object.keys(GROUPS).join('|')}> [...]`
  );
  process.exit(1);
}

const missing = new Set();

for (const group of groups) {
  const keys = GROUPS[group];

  if (!keys) {
    console.error(`Unknown environment group "${group}".`);
    process.exit(1);
  }

  for (const key of keys) {
    if (!hasValue(process.env[key])) {
      missing.add(key);
    }
  }
}

if (missing.size > 0) {
  console.error(`Missing required environment variables: ${Array.from(missing).join(', ')}`);
  process.exit(1);
}

console.log(`Environment check passed for groups: ${groups.join(', ')}`);
