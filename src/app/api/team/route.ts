import { NextResponse } from 'next/server';
import { getTeamPageData } from '@/lib/server/data';
import { handleRouteError } from '@/lib/server/api';

export async function GET() {
  try {
    const data = await getTeamPageData();
    return NextResponse.json(data);
  } catch (error) {
    return handleRouteError(error);
  }
}
