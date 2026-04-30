import { test, expect } from '@playwright/test';

function normalizeSmokeToken(value: string | undefined) {
  if (typeof value !== 'string') {
    return undefined;
  }

  const normalized = value.replace(/[\r\n]+/g, '').trim();
  return normalized.length > 0 ? normalized : undefined;
}

test('login page renders the sign-in controls', async ({ page }) => {
  await page.goto('/login');

  await expect(page.getByRole('heading', { name: 'Sign in to FernFlow' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Continue with Google' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Send magic link' })).toBeVisible();
});

test('root redirects unauthenticated visitors to login', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/login$/);
});

test('health endpoint reports ok', async ({ request }) => {
  const response = await request.get('/api/health');

  expect(response.ok()).toBeTruthy();

  const body = await response.json();
  expect(body.status).toBe('ok');
  expect(typeof body.services.supabaseConfigured).toBe('boolean');
});

test('protected smoke route succeeds when configured', async ({ request }) => {
  const smokeToken = normalizeSmokeToken(process.env.CI_SMOKE_TOKEN);

  if (!smokeToken) {
    test.skip(true, 'CI_SMOKE_TOKEN is not configured for this environment.');
    return;
  }

  const response = await request.post('/api/smoke', {
    headers: {
      'content-type': 'application/json',
      'x-ci-smoke-token': smokeToken,
    },
  });

  expect(response.ok()).toBeTruthy();

  const body = await response.json();
  expect(body.ok).toBe(true);
});
