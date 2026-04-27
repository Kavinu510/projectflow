import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { markAllNotificationsRead } from '@/lib/server/data';
import { handleRouteError } from '@/lib/server/api';

export async function POST() {
  try {
    await markAllNotificationsRead();
    revalidatePath('/notifications');
    revalidatePath('/dashboard-overview');
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
