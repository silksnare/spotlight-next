import { NextResponse } from 'next/server';

import { createServiceProvider } from '@/lib/saml/service-provider';

export async function GET() {
  const sp = createServiceProvider();
  const metadataXml = sp.getMetadata();

  return new NextResponse(metadataXml, {
    status: 200,
    headers: {
      'Content-Type': 'application/samlmetadata+xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
