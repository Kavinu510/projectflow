import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { getProfilePageData, updateProfileRecord } from '@/lib/server/data';
import { handleRouteError, parseRequestBody } from '@/lib/server/api';
import { profileUpdateSchema } from '@/lib/validators';

export async function GET() {
  try {
    const data = await getProfilePageData();
    return NextResponse.json(data);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const payload = await parseRequestBody(request, profileUpdateSchema);
    await updateProfileRecord(payload);
    revalidatePath('/profile');
    revalidatePath('/dashboard-overview');
    revalidatePath('/notifications');
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
