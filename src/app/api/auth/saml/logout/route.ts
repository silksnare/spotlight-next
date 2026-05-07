import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.info('SAML logout endpoint hit; delegating to local logout endpoint.');
  return NextResponse.redirect(new URL('/api/auth/logout', request.url));
}
