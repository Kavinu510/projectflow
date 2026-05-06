import { type NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = '/api/notifications/mark-all-read';
  return NextResponse.redirect(url, 307);
}
