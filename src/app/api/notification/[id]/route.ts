import { type NextRequest, NextResponse } from 'next/server';

function buildNotificationByIdUrl(request: NextRequest, id: string) {
  const url = request.nextUrl.clone();
  url.pathname = `/api/notifications/${id}`;
  return url;
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return NextResponse.redirect(buildNotificationByIdUrl(request, id), 307);
}
