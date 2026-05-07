import { NextRequest, NextResponse } from 'next/server';

import { clearSessionCookie } from '@/lib/auth/session';
import { getSamlConfig } from '@/lib/saml/config';

function getLoginUrl() {
  const cfg = getSamlConfig();
  return new URL('/login', cfg.APP_BASE_URL);
}

function buildIdpLogoutUrl(request: NextRequest) {
  const cfg = getSamlConfig();
  if (!cfg.SAML_IDP_SLO_URL) return null;

  const idpLogout = new URL(cfg.SAML_IDP_SLO_URL);
  idpLogout.searchParams.set('RelayState', new URL('/login?signedOut=1', request.url).toString());
  return idpLogout;
}

function clearSessionAndRedirect(request: NextRequest) {
  const idpLogoutUrl = buildIdpLogoutUrl(request);
  const destination = idpLogoutUrl ?? getLoginUrl();

  const response = NextResponse.redirect(destination);
  clearSessionCookie(response);
  return response;
}

export async function POST(request: NextRequest) {
  console.info('Auth logout: clearing local app session.');
  return clearSessionAndRedirect(request);
}

export async function GET(request: NextRequest) {
  console.info('Auth logout: clearing local app session.');
  return clearSessionAndRedirect(request);
}
