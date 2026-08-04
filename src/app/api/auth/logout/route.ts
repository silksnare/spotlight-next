import { NextRequest, NextResponse } from 'next/server'

import { clearSessionCookie } from '@/lib/auth/session'

function clearSessionAndRedirect() {
  const appBaseUrl = process.env.APP_BASE_URL

  if (!appBaseUrl) {
    throw new Error('APP_BASE_URL is not configured')
  }

  const response = NextResponse.redirect(
    new URL('/login', appBaseUrl)
  )

  clearSessionCookie(response)

  return response
}

export async function POST() {
  console.info('Auth logout: clearing local app session.')
  return clearSessionAndRedirect()
}

export async function GET() {
  console.info('Auth logout: clearing local app session.')
  return clearSessionAndRedirect()
}
