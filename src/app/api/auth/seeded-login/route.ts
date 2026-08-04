import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/db/prisma';
import { setSessionCookie } from '@/lib/auth/session';
import { buildLocalSession } from '@/lib/auth/local-session';

function normalize(value: unknown) {
  return String(value ?? '').trim();
}

function toNullableNumber(value: string | null | undefined) {
  if (!value) return null;

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : null;
}

export async function POST(request: NextRequest) {
  const { email, gmin } = await request.json();

  const normalizedEmail = normalize(email).toLowerCase();
  const normalizedGmin = normalize(gmin);

  if (!normalizedEmail || !normalizedGmin) {
    return NextResponse.json(
      { error: 'Email and GMIN are required' },
      { status: 400 }
    );
  }

  const seededUser = await prisma.seededLoginUser.findFirst({
    where: {
      email: {
        equals: normalizedEmail,
        mode: 'insensitive',
      },
      gmin: normalizedGmin,
      active: true,
    },
  });

  if (!seededUser) {
    return NextResponse.json(
      { error: 'Invalid email or GMIN' },
      { status: 401 }
    );
  }

  const displayName =
    `${seededUser.firstName ?? ''} ${seededUser.lastName ?? ''}`.trim() ||
    seededUser.gmin;

  const user = await prisma.user.upsert({
    where: {
      employeeId: seededUser.gmin,
    },

    update: {
      email: seededUser.email,
      firstName: seededUser.firstName ?? '',
      lastName: seededUser.lastName ?? '',
      displayName,
      homeArea: toNullableNumber(seededUser.region),
      district: toNullableNumber(seededUser.district),
      active: true,
    },

    create: {
      employeeId: seededUser.gmin,
      email: seededUser.email,
      firstName: seededUser.firstName ?? '',
      lastName: seededUser.lastName ?? '',
      displayName,
      homeArea: toNullableNumber(seededUser.region),
      district: toNullableNumber(seededUser.district),
      active: true,
    },

    include: {
      userRoles: true,
    },
  });

  if (user.userRoles.length === 0) {
    const role = seededUser.role || 'uploader';

    await prisma.userRole.create({
      data: {
        userId: user.id,
        role,
      },
    });
  }

  const userWithRoles = await prisma.user.findUniqueOrThrow({
    where: {
      id: user.id,
    },

    include: {
      userRoles: true,
    },
  });

  const response = NextResponse.json({ ok: true });

  await setSessionCookie(response, buildLocalSession(userWithRoles));

  return response;
}