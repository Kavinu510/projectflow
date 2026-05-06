import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { markAllNotificationsRead } from '@/lib/server/data';
import { getWorkspaceIdFromRequest, handleRouteError } from '@/lib/server/api';

export async function POST(request: Request) {
  try {
    const workspaceId = getWorkspaceIdFromRequest(request);
    await markAllNotificationsRead(workspaceId ?? undefined);
    revalidatePath('/notifications');
    revalidatePath('/dashboard-overview');
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
