import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { createTaskRecord, getTasksPageData } from '@/lib/server/data';
import { handleRouteError, parseRequestBody } from '@/lib/server/api';
import { taskInputSchema } from '@/lib/validators';

export async function GET() {
  try {
    const data = await getTasksPageData();
    return NextResponse.json({
      tasks: data.tasks,
      projects: data.projects,
      members: data.members,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const payload = await parseRequestBody(request, taskInputSchema);
    const task = await createTaskRecord(payload);
    revalidatePath('/dashboard-overview');
    revalidatePath('/task-list-view');
    revalidatePath('/project-management');
    revalidatePath('/notifications');
    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
