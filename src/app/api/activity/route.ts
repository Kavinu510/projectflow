import { NextResponse } from 'next/server';
import { getActivityData } from '@/lib/server/data';
import { getWorkspaceIdFromRequest, handleRouteError } from '@/lib/server/api';

export async function GET(request: Request) {
  try {
    const workspaceId = getWorkspaceIdFromRequest(request);
    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get('limit') ?? '20');
    const activity = await getActivityData(
      Number.isNaN(limit) ? 20 : limit,
      workspaceId ?? undefined
    );
    return NextResponse.json({ activity });
  } catch (error) {
    return handleRouteError(error);
  }
}
