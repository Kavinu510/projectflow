import { describe, expect, it } from 'vitest';
import { handleRouteError } from '@/lib/server/api';

describe('handleRouteError', () => {
  it('maps authentication errors to 401', async () => {
    const response = handleRouteError(new Error('Authentication required.'));
    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: 'Authentication required.' });
  });

  it('maps permission-style errors to 403', async () => {
    const response = handleRouteError(new Error('permission denied'));
    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ error: 'permission denied' });
  });

  it('maps unknown values to 500', async () => {
    const response = handleRouteError('bad payload');
    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: 'Unexpected server error.' });
  });
});
