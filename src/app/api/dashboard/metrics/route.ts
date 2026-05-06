import { NextResponse } from 'next/server';
import { getDashboardPageData } from '@/lib/server/data';
import { getWorkspaceIdFromRequest, handleRouteError } from '@/lib/server/api';

export async function GET(request: Request) {
  try {
    const workspaceId = getWorkspaceIdFromRequest(request);
    const data = await getDashboardPageData(workspaceId ?? undefined);
    return NextResponse.json(data.metrics);
  } catch (error) {
    return handleRouteError(error);
  }
}
