import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { deleteProjectRecord, updateProjectRecord } from '@/lib/server/data';
import { handleRouteError, parseRequestBody } from '@/lib/server/api';
import { projectInputSchema } from '@/lib/validators';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const payload = await parseRequestBody(request, projectInputSchema);
    const project = await updateProjectRecord(id, payload);
    revalidatePath('/dashboard-overview');
    revalidatePath('/project-management');
    revalidatePath('/team');
    return NextResponse.json({ project });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await deleteProjectRecord(id);
    revalidatePath('/dashboard-overview');
    revalidatePath('/project-management');
    revalidatePath('/team');
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
