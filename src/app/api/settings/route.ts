import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { getSettingsPageData, updateWorkspaceSettingsRecord } from '@/lib/server/data';
import { getWorkspaceIdFromRequest, handleRouteError, parseRequestBody } from '@/lib/server/api';
import { workspaceSettingsSchema } from '@/lib/validators';

export async function GET(request: Request) {
  try {
    const workspaceId = getWorkspaceIdFromRequest(request);
    const data = await getSettingsPageData(workspaceId ?? undefined);
    return NextResponse.json(data);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const workspaceId = getWorkspaceIdFromRequest(request);
    const payload = await parseRequestBody(request, workspaceSettingsSchema);
    await updateWorkspaceSettingsRecord(payload, workspaceId ?? undefined);
    revalidatePath('/settings');
    revalidatePath('/dashboard-overview');
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
