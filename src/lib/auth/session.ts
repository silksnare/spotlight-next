import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { cache } from 'react';

import type { AppRole } from './roles';

const SESSION_COOKIE = 'spotlight_session';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

export type SpotlightUser = {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  role: AppRole;
  roles?: AppRole[];
  homeArea: number | null;
  district: number | null;
};

export type AppSession = {
  user: SpotlightUser;
  samlSessionIndex?: string;
  iat?: number;
  exp?: number;
};

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('SESSION_SECRET must be set and contain at least 32 characters.');
  }

  return new TextEncoder().encode(secret);
}

export async function createSessionToken(session: AppSession) {
  return new SignJWT(session)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSessionSecret());
}

export async function readSessionToken(token: string): Promise<AppSession | null> {
  try {
    const { payload } = await jwtVerify(token, getSessionSecret());
    return payload as AppSession;
  } catch {
    return null;
  }
}

export async function setSessionCookie(response: NextResponse, session: AppSession) {
  const token = await createSessionToken(session);

  response.cookies.set({
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set({
    name: SESSION_COOKIE,
    value: '',
    path: '/',
    maxAge: 0,
  });
}

export const getCurrentSession = cache(async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) return null;
  return readSessionToken(token);
});

export { SESSION_COOKIE };
