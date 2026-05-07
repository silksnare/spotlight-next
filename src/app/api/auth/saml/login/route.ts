import { NextResponse } from 'next/server';

import { createIdentityProvider, createServiceProvider } from '@/lib/saml/service-provider';

export async function GET() {
  try {
    const sp = createServiceProvider();
    const idp = createIdentityProvider();

    const { context } = await sp.createLoginRequest(idp, 'redirect');
    console.info('SAML login initiation success');
    return NextResponse.redirect(context);
  } catch (error) {
    console.error('SAML login initiation failed', error);
    return NextResponse.json({ error: 'SAML configuration missing or invalid.' }, { status: 500 });
  }
}
