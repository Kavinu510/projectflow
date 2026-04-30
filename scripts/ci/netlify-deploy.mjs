import { spawnSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';
import { EOL } from 'node:os';
import { pathToFileURL } from 'node:url';

function parseJsonCandidate(candidate) {
  try {
    return JSON.parse(candidate);
  } catch {
    return null;
  }
}

export function extractNetlifyDeployPayload(stdout) {
  const trimmed = stdout.trim();

  if (!trimmed) {
    throw new Error('Netlify deploy completed but returned no output.');
  }

  const directPayload = parseJsonCandidate(trimmed);

  if (directPayload) {
    return directPayload;
  }

  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');

  if (firstBrace !== -1 && lastBrace > firstBrace) {
    const embeddedPayload = parseJsonCandidate(trimmed.slice(firstBrace, lastBrace + 1));

    if (embeddedPayload) {
      return embeddedPayload;
    }
  }

  const lines = trimmed.split(/\r?\n/).filter(Boolean);
  const firstJsonLineIndex = lines.findIndex((line) => line.trim().startsWith('{'));

  if (firstJsonLineIndex !== -1) {
    const multilinePayload = parseJsonCandidate(lines.slice(firstJsonLineIndex).join('\n'));

    if (multilinePayload) {
      return multilinePayload;
    }
  }

  console.error(trimmed);
  throw new Error('Netlify deploy completed but no valid JSON payload was returned.');
}

function main() {
  const target = process.argv[2];

  const CONFIG = {
    preview: {
      context: 'deploy-preview',
      prod: false,
      message: `Deploy preview for ${process.env.GITHUB_HEAD_REF ?? process.env.GITHUB_REF_NAME ?? 'preview'}`,
    },
    staging: {
      context: 'production',
      prod: true,
      message: `Staging release for ${process.env.GITHUB_SHA ?? 'unknown-sha'}`,
    },
    production: {
      context: 'production',
      prod: true,
      message: `Production release for ${process.env.GITHUB_SHA ?? 'unknown-sha'}`,
    },
  };

  if (!target || !CONFIG[target]) {
    console.error('Usage: node scripts/ci/netlify-deploy.mjs <preview|staging|production>');
    process.exit(1);
  }

  for (const key of ['NETLIFY_AUTH_TOKEN', 'NETLIFY_SITE_ID']) {
    if (!process.env[key]) {
      console.error(`Missing required environment variable: ${key}`);
      process.exit(1);
    }
  }

  const npxExecutable = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  const config = CONFIG[target];
  const alias =
    target === 'preview'
      ? `pr-${process.env.PR_NUMBER ?? process.env.GITHUB_RUN_ID ?? Date.now()}`
          .toLowerCase()
          .replace(/[^a-z0-9-]/g, '-')
          .slice(0, 37)
      : null;

  const args = [
    '--yes',
    'netlify@26.0.0',
    'deploy',
    '--json',
    '--timeout',
    '1200000',
    '--site',
    process.env.NETLIFY_SITE_ID,
    '--auth',
    process.env.NETLIFY_AUTH_TOKEN,
    '--context',
    config.context,
    '--message',
    config.message,
  ];

  if (config.prod) {
    args.push('--prod');
  }

  if (alias) {
    args.push('--alias', alias);
  }

  const result = spawnSync(npxExecutable, args, {
    cwd: process.cwd(),
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    env: process.env,
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    console.error(result.stdout);
    console.error(result.stderr);
    process.exit(result.status ?? 1);
  }

  const payload = extractNetlifyDeployPayload(result.stdout);
  const deployUrl =
    payload.deploy_url ??
    payload.deployUrl ??
    payload.url ??
    payload.ssl_url ??
    payload.deploy_ssl_url ??
    null;
  const logsUrl = payload.logs ?? payload.logs_url ?? payload.logsUrl ?? null;
  const deployId = payload.deploy_id ?? payload.id ?? null;

  if (!deployUrl) {
    console.error(result.stdout.trim());
    throw new Error('Netlify deploy payload did not include a deploy URL.');
  }

  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, `deploy_url=${deployUrl}${EOL}`);
    appendFileSync(process.env.GITHUB_OUTPUT, `deploy_id=${deployId ?? ''}${EOL}`);
    appendFileSync(process.env.GITHUB_OUTPUT, `logs_url=${logsUrl ?? ''}${EOL}`);
  }

  console.log(`Netlify ${target} deploy succeeded.`);
  console.log(`Deploy URL: ${deployUrl}`);
  if (logsUrl) {
    console.log(`Logs URL: ${logsUrl}`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
