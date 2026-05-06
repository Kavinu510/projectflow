import { NextResponse } from 'next/server';
import { getTeamPageData } from '@/lib/server/data';
import { getWorkspaceIdFromRequest, handleRouteError } from '@/lib/server/api';

export async function GET(request: Request) {
  try {
    const workspaceId = getWorkspaceIdFromRequest(request);
    const data = await getTeamPageData(workspaceId ?? undefined);
    return NextResponse.json(data);
  } catch (error) {
    return handleRouteError(error);
  }
}
