import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { getProfilePageData, updateProfileRecord } from '@/lib/server/data';
import { getWorkspaceIdFromRequest, handleRouteError, parseRequestBody } from '@/lib/server/api';
import { profileUpdateSchema } from '@/lib/validators';

export async function GET(request: Request) {
  try {
    const workspaceId = getWorkspaceIdFromRequest(request);
    const data = await getProfilePageData(workspaceId ?? undefined);
    return NextResponse.json(data);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const workspaceId = getWorkspaceIdFromRequest(request);
    const payload = await parseRequestBody(request, profileUpdateSchema);
    await updateProfileRecord(payload, workspaceId ?? undefined);
    revalidatePath('/profile');
    revalidatePath('/dashboard-overview');
    revalidatePath('/notifications');
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
