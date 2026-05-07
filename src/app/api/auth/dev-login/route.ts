import { NextRequest, NextResponse } from 'next/server';

import { buildDevIdentity, isDevBypassEnabled } from '@/lib/auth/dev';
import { setSessionCookie } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  if (!isDevBypassEnabled()) {
    return NextResponse.json({ error: 'Dev bypass mode disabled.' }, { status: 403 });
  }

  const response = NextResponse.redirect(new URL('/dashboard', request.url));
  await setSessionCookie(response, buildDevIdentity());

  return response;
}
