import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { deleteTaskRecord, updateTaskRecord } from '@/lib/server/data';
import { handleRouteError, parseRequestBody } from '@/lib/server/api';
import { taskInputSchema } from '@/lib/validators';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const payload = await parseRequestBody(request, taskInputSchema);
    const task = await updateTaskRecord(id, payload);
    revalidatePath('/dashboard-overview');
    revalidatePath('/task-list-view');
    revalidatePath('/project-management');
    revalidatePath('/notifications');
    return NextResponse.json({ task });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await deleteTaskRecord(id);
    revalidatePath('/dashboard-overview');
    revalidatePath('/task-list-view');
    revalidatePath('/project-management');
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
