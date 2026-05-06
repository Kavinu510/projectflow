import { type NextRequest, NextResponse } from 'next/server';

function buildNotificationsUrl(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = '/api/notifications';
  return url;
}

export async function GET(request: NextRequest) {
  return NextResponse.redirect(buildNotificationsUrl(request), 307);
}

export async function POST(request: NextRequest) {
  return NextResponse.redirect(buildNotificationsUrl(request), 307);
}
