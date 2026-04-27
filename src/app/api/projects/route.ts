import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { createProjectRecord, getProjectsPageData } from '@/lib/server/data';
import { handleRouteError, parseRequestBody } from '@/lib/server/api';
import { projectInputSchema } from '@/lib/validators';

export async function GET() {
  try {
    const data = await getProjectsPageData();
    return NextResponse.json({ projects: data.projects, members: data.members });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const payload = await parseRequestBody(request, projectInputSchema);
    const project = await createProjectRecord(payload);
    revalidatePath('/dashboard-overview');
    revalidatePath('/project-management');
    revalidatePath('/team');
    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
