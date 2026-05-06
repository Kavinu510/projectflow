import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { createProjectRecord, getProjectsPageData } from '@/lib/server/data';
import { getWorkspaceIdFromRequest, handleRouteError, parseRequestBody } from '@/lib/server/api';
import { projectInputSchema } from '@/lib/validators';

export async function GET(request: Request) {
  try {
    const workspaceId = getWorkspaceIdFromRequest(request);
    const data = await getProjectsPageData(workspaceId ?? undefined);
    return NextResponse.json({ projects: data.projects, members: data.members });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const workspaceId = getWorkspaceIdFromRequest(request);
    const payload = await parseRequestBody(request, projectInputSchema);
    const project = await createProjectRecord(payload, workspaceId ?? undefined);
    revalidatePath('/dashboard-overview');
    revalidatePath('/project-management');
    revalidatePath('/team');
    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
