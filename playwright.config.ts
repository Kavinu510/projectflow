import { defineConfig } from '@playwright/test';

const baseURL =
  process.env.PLAYWRIGHT_BASE_URL ?? process.env.SMOKE_BASE_URL ?? 'http://127.0.0.1:4028';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never', outputFolder: 'playwright-report' }]]
    : [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  use: {
    baseURL,
    trace: 'retain-on-failure',
  },
});
