import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { readSessionToken, SESSION_COOKIE } from '@/lib/auth/session';

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const cookie = request.cookies.get(SESSION_COOKIE)?.value;
    const session = cookie ? await readSessionToken(cookie) : null;

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const body = await request.json();

    const decision = body?.decision;
    const reasons = Array.isArray(body?.reasons)
      ? body.reasons.filter((value: unknown): value is string => {
          return typeof value === 'string' && value.trim().length > 0;
        })
      : [];
    const otherReason =
      typeof body?.otherReason === 'string' ? body.otherReason.trim() : '';

    if (decision !== 'qualified' && decision !== 'disqualified') {
      return NextResponse.json(
        { success: false, error: 'Invalid decision' },
        { status: 400 }
      );
    }

    if (
      decision === 'disqualified' &&
      reasons.length === 0 &&
      otherReason.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'At least one disqualification reason is required',
        },
        { status: 400 }
      );
    }

    const actor =
      session.user.employeeId || session.user.email || session.user.id;

    const updated = await prisma.videoSubmission.update({
      where: { id },
      data:
        decision === 'qualified'
          ? {
              isQualified: true,
              qualifiedAt: new Date(),
              qualifiedBy: actor,
              disqualificationReasons: [],
              disqualificationOther: null,
              disqualifiedAt: null,
              disqualifiedBy: null,
            }
          : {
              isQualified: false,
              qualifiedAt: new Date(),
              qualifiedBy: actor,
              disqualificationReasons: reasons,
              disqualificationOther: otherReason || null,
              disqualifiedAt: new Date(),
              disqualifiedBy: actor,
            },
    });

    return NextResponse.json({ success: true, video: updated });
  } catch (error) {
    console.error('QUALIFY_UPDATE_ERROR', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update qualification status' },
      { status: 500 }
    );
  }
}