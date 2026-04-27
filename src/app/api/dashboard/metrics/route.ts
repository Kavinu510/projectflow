import { NextResponse } from 'next/server';
import { getDashboardPageData } from '@/lib/server/data';
import { handleRouteError } from '@/lib/server/api';

export async function GET() {
  try {
    const data = await getDashboardPageData();
    return NextResponse.json(data.metrics);
  } catch (error) {
    return handleRouteError(error);
  }
}
