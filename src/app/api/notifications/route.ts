import { NextResponse } from 'next/server';
import { getNotificationsData } from '@/lib/server/data';
import { getWorkspaceIdFromRequest, handleRouteError } from '@/lib/server/api';

export async function GET(request: Request) {
  try {
    const workspaceId = getWorkspaceIdFromRequest(request);
    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const notifications = await getNotificationsData(unreadOnly, workspaceId ?? undefined);
    return NextResponse.json({ notifications });
  } catch (error) {
    return handleRouteError(error);
  }
}
