import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { updateTeamMemberRecord } from '@/lib/server/data';
import { handleRouteError, parseRequestBody } from '@/lib/server/api';
import { teamMemberUpdateSchema } from '@/lib/validators';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ memberId: string }> }
) {
  try {
    const { memberId } = await params;
    const payload = await parseRequestBody(request, teamMemberUpdateSchema);
    await updateTeamMemberRecord(memberId, payload);
    revalidatePath('/team');
    revalidatePath('/project-management');
    revalidatePath('/notifications');
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
