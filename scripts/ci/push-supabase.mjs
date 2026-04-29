import { spawnSync } from 'node:child_process';

const target = process.argv[2] ?? 'target';
const executable = process.platform === 'win32' ? 'supabase.exe' : 'supabase';

for (const key of ['SUPABASE_ACCESS_TOKEN', 'SUPABASE_PROJECT_ID', 'SUPABASE_DB_PASSWORD']) {
  if (!process.env[key]) {
    console.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

function run(args) {
  const result = spawnSync(executable, args, {
    cwd: process.cwd(),
    encoding: 'utf8',
    stdio: 'inherit',
    env: process.env,
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log(`Linking FernFlow to the ${target} Supabase project...`);
run(['link', '--project-ref', process.env.SUPABASE_PROJECT_ID]);

console.log(`Pushing migrations to the ${target} Supabase project...`);
run(['db', 'push', '--linked']);
