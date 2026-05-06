import { NextResponse } from 'next/server';
import { ZodSchema } from 'zod';
import { WORKSPACE_HEADER_KEY } from '@/lib/server/workspace-context';

export async function parseRequestBody<T>(request: Request, schema: ZodSchema<T>) {
  const json = await request.json();
  return schema.parse(json);
}

function cleanWorkspaceId(value: string | null) {
  if (!value) {
    return null;
  }

  const candidate = value.trim();
  return candidate.length > 0 ? candidate : null;
}

export function getWorkspaceIdFromRequest(request: Request) {
  const fromHeader = cleanWorkspaceId(request.headers.get(WORKSPACE_HEADER_KEY));
  if (fromHeader) {
    return fromHeader;
  }

  const url = new URL(request.url);
  return cleanWorkspaceId(url.searchParams.get('workspaceId'));
}

export function handleRouteError(error: unknown) {
  if (error instanceof Error) {
    const message = error.message;

    if (message === 'Authentication required.') {
      return NextResponse.json({ error: message }, { status: 401 });
    }

    if (
      message.includes('permission') ||
      message.includes('inactive') ||
      message.includes('owner')
    ) {
      return NextResponse.json({ error: message }, { status: 403 });
    }

    return NextResponse.json({ error: message }, { status: 400 });
  }

  return NextResponse.json({ error: 'Unexpected server error.' }, { status: 500 });
}
