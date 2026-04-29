function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const baseUrl = process.env.SMOKE_BASE_URL;

if (!baseUrl) {
  console.error('Missing required environment variable: SMOKE_BASE_URL');
  process.exit(1);
}

const origin = new URL(baseUrl);

async function checkHealth() {
  const response = await fetch(new URL('/api/health', origin), {
    headers: { accept: 'application/json' },
  });
  assert(response.ok, `/api/health failed with status ${response.status}`);
  const body = await response.json();
  assert(body.status === 'ok', 'Health endpoint did not report ok status.');
}

async function checkLoginPage() {
  const response = await fetch(new URL('/login', origin));
  assert(response.ok, `/login failed with status ${response.status}`);
  const body = await response.text();
  assert(body.includes('Sign in to FernFlow'), 'Login page did not render the expected heading.');
}

async function checkRootRedirect() {
  const response = await fetch(new URL('/', origin), { redirect: 'manual' });

  if (response.status >= 300 && response.status < 400) {
    const location = response.headers.get('location') ?? '';
    assert(
      location.includes('/login') || location.includes('/dashboard-overview'),
      `Unexpected redirect target from /: ${location || '<empty>'}`
    );
    return;
  }

  assert(response.ok, `Expected / to resolve successfully, received status ${response.status}.`);

  const body = await response.text();
  assert(
    body.includes('Sign in to FernFlow') || body.includes('dashboard-overview'),
    'Root response did not look like a login or dashboard page.'
  );
}

async function runProtectedSmoke() {
  if (!process.env.CI_SMOKE_TOKEN) {
    console.log('Skipping protected smoke route because CI_SMOKE_TOKEN is not configured.');
    return;
  }

  const response = await fetch(new URL('/api/smoke', origin), {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-ci-smoke-token': process.env.CI_SMOKE_TOKEN,
    },
  });

  assert(response.ok, `/api/smoke failed with status ${response.status}`);
  const body = await response.json();
  assert(body.ok === true, 'Protected smoke route did not report success.');
}

await checkHealth();
await checkLoginPage();
await checkRootRedirect();
await runProtectedSmoke();

console.log(`Smoke checks completed successfully for ${origin.origin}`);
