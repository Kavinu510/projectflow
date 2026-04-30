import { describe, expect, it } from 'vitest';
import {
  DEFAULT_AUTH_REDIRECT_PATH,
  buildAuthCompleteUrl,
  getSafeRedirectPath,
} from '@/lib/auth/redirect';

describe('auth redirect helpers', () => {
  it('keeps safe same-origin paths', () => {
    expect(getSafeRedirectPath('/settings')).toBe('/settings');
    expect(getSafeRedirectPath('/dashboard-overview?tab=mine#today')).toBe(
      '/dashboard-overview?tab=mine#today'
    );
  });

  it('falls back for external or malformed destinations', () => {
    expect(getSafeRedirectPath('https://example.com')).toBe(DEFAULT_AUTH_REDIRECT_PATH);
    expect(getSafeRedirectPath('//example.com')).toBe(DEFAULT_AUTH_REDIRECT_PATH);
    expect(getSafeRedirectPath('dashboard-overview')).toBe(DEFAULT_AUTH_REDIRECT_PATH);
    expect(getSafeRedirectPath('/dashboard\nSet-Cookie:bad=true')).toBe(DEFAULT_AUTH_REDIRECT_PATH);
  });

  it('builds an intermediate auth completion URL', () => {
    const url = buildAuthCompleteUrl('https://staging.example.com', '/settings');

    expect(url.toString()).toBe('https://staging.example.com/auth/complete?next=%2Fsettings');
  });
});
