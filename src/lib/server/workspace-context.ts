import { cookies, headers } from 'next/headers';

export const WORKSPACE_COOKIE_KEY = 'fernflow-workspace-id';
export const WORKSPACE_HEADER_KEY = 'x-workspace-id';

function cleanWorkspaceId(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const candidate = value.trim();
  return candidate.length > 0 ? candidate : null;
}

export async function resolveWorkspaceIdFromRuntimeContext() {
  const cookieStore = await cookies();
  const headerStore = await headers();

  const fromHeader = cleanWorkspaceId(headerStore.get(WORKSPACE_HEADER_KEY));
  if (fromHeader) {
    return fromHeader;
  }

  return cleanWorkspaceId(cookieStore.get(WORKSPACE_COOKIE_KEY)?.value);
}
