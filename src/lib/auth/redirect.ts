export const DEFAULT_AUTH_REDIRECT_PATH = '/dashboard-overview';

function hasControlCharacters(value: string) {
  return Array.from(value).some((character) => {
    const code = character.charCodeAt(0);
    return code <= 31 || code === 127;
  });
}

export function getSafeRedirectPath(value: string | string[] | null | undefined) {
  const candidate = Array.isArray(value) ? value[0] : value;

  if (typeof candidate !== 'string') {
    return DEFAULT_AUTH_REDIRECT_PATH;
  }

  const path = candidate.trim();

  if (!path || !path.startsWith('/') || path.startsWith('//')) {
    return DEFAULT_AUTH_REDIRECT_PATH;
  }

  if (hasControlCharacters(path)) {
    return DEFAULT_AUTH_REDIRECT_PATH;
  }

  return path;
}

export function buildAuthCompleteUrl(origin: string, next: string | string[] | null | undefined) {
  const url = new URL('/auth/complete', origin);
  url.searchParams.set('next', getSafeRedirectPath(next));
  return url;
}
