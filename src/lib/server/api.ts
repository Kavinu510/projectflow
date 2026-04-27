import { NextResponse } from 'next/server';
import { ZodSchema } from 'zod';

export async function parseRequestBody<T>(request: Request, schema: ZodSchema<T>) {
  const json = await request.json();
  return schema.parse(json);
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
