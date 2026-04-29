import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const targetFile =
  process.argv[2] ?? path.join(process.cwd(), 'release-artifacts', 'release-manifest.json');

const manifest = {
  environment: process.env.RELEASE_ENVIRONMENT ?? 'unknown',
  commitSha: process.env.GITHUB_SHA ?? process.env.RELEASE_SHA ?? null,
  generatedAt: new Date().toISOString(),
  workflow: {
    runId: process.env.GITHUB_RUN_ID ?? null,
    runNumber: process.env.GITHUB_RUN_NUMBER ?? null,
    actor: process.env.GITHUB_ACTOR ?? null,
    ref: process.env.GITHUB_REF ?? null,
  },
  netlify: {
    siteId: process.env.NETLIFY_SITE_ID ?? null,
    deployId: process.env.NETLIFY_DEPLOY_ID ?? null,
    deployUrl: process.env.NETLIFY_DEPLOY_URL ?? null,
    logsUrl: process.env.NETLIFY_LOGS_URL ?? null,
  },
  supabase: {
    projectId: process.env.SUPABASE_PROJECT_ID ?? null,
  },
};

mkdirSync(path.dirname(targetFile), { recursive: true });
writeFileSync(targetFile, JSON.stringify(manifest, null, 2));

console.log(`Release manifest written to ${targetFile}`);
