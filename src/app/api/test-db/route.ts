import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const phases = await prisma.phase.findMany({
      orderBy: { key: 'asc' },
    });

    return NextResponse.json({
      success: true,
      count: phases.length,
      phases,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: 'Phase query failed',
      },
      { status: 500 }
    );
  }
}