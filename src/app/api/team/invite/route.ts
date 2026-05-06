import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { inviteTeamMemberRecord } from '@/lib/server/data';
import { getWorkspaceIdFromRequest, handleRouteError, parseRequestBody } from '@/lib/server/api';
import { teamInviteSchema } from '@/lib/validators';

export async function POST(request: Request) {
  try {
    const workspaceId = getWorkspaceIdFromRequest(request);
    const payload = await parseRequestBody(request, teamInviteSchema);
    await inviteTeamMemberRecord(payload, workspaceId ?? undefined);
    revalidatePath('/team');
    revalidatePath('/notifications');
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
