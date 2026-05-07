import { NextResponse } from 'next/server';
import { isPhaseActiveFromDb } from '@/lib/phases/is-phase-active-from-db';

export async function GET() {
  const isActive = await isPhaseActiveFromDb('upload');

  return NextResponse.json({ isActive });
}
