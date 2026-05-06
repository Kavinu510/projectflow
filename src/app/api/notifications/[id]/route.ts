import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { markNotificationRead } from '@/lib/server/data';
import { getWorkspaceIdFromRequest, handleRouteError, parseRequestBody } from '@/lib/server/api';
import { notificationUpdateSchema } from '@/lib/validators';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const workspaceId = getWorkspaceIdFromRequest(request);
    const { id } = await params;
    const payload = await parseRequestBody(request, notificationUpdateSchema);
    await markNotificationRead(id, payload.isRead, workspaceId ?? undefined);
    revalidatePath('/notifications');
    revalidatePath('/dashboard-overview');
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
