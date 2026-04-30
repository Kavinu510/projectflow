import { describe, expect, it } from 'vitest';
import { extractNetlifyDeployPayload } from './netlify-deploy.mjs';

describe('extractNetlifyDeployPayload', () => {
  it('parses multiline JSON output from the Netlify CLI', () => {
    const payload = extractNetlifyDeployPayload(`{
  "deploy_url": "https://preview.example.netlify.app",
  "logs": "https://app.netlify.com/sites/example/deploys/123"
}`);

    expect(payload.deploy_url).toBe('https://preview.example.netlify.app');
    expect(payload.logs).toBe('https://app.netlify.com/sites/example/deploys/123');
  });

  it('parses JSON payloads even when the CLI prints log lines before them', () => {
    const payload = extractNetlifyDeployPayload(`Netlify CLI 26.0.0
Preparing deploy...
{
  "deploy_url": "https://preview.example.netlify.app",
  "id": "deploy-123"
}`);

    expect(payload.deploy_url).toBe('https://preview.example.netlify.app');
    expect(payload.id).toBe('deploy-123');
  });
});
