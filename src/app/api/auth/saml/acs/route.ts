import { NextRequest, NextResponse } from 'next/server';

import { setSessionCookie } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { normalizeSamlIdentity } from '@/lib/saml/attributes';
import { createIdentityProvider, createServiceProvider } from '@/lib/saml/service-provider';

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export async function POST(request: NextRequest) {
  try {
    const sp = createServiceProvider();
    const idp = createIdentityProvider();

    const formData = await request.formData();
    const samlResponse = formData.get('SAMLResponse');

    if (typeof samlResponse !== 'string' || !samlResponse) {
      console.warn('SAML ACS: missing SAMLResponse form field.');
      return NextResponse.redirect(new URL('/login?error=saml_missing_response', request.url), {
        status: 303,
      });
    }

    const decodedXml = Buffer.from(samlResponse, 'base64').toString('utf-8');

    console.log('=== RAW SAML RESPONSE XML START ===');
    console.log(decodedXml);
    console.log('=== RAW SAML RESPONSE XML END ===');

    const { extract } = await sp.parseLoginResponse(idp, 'post', {
      body: { SAMLResponse: samlResponse },
    });

    console.log('=== RAW SAML EXTRACT ===');
    console.dir(extract, { depth: null });

    const assertionAttributes = (extract.attributes ?? {}) as Record<string, unknown>;
    const identity = normalizeSamlIdentity(assertionAttributes);

    if (!identity.employeeId || !identity.email) {
      console.error('SAML ACS: missing required normalized identity fields', {
        hasEmployeeId: Boolean(identity.employeeId),
        hasEmail: Boolean(identity.email),
      });
      return NextResponse.redirect(new URL('/login?error=saml_missing_attributes', request.url), {
        status: 303,
      });
    }

    const normalizedEmail = normalizeEmail(identity.email);

    const districtLookup = await prisma.userDistrictLookup.findUnique({
      where: { email: normalizedEmail },
      select: { district: true },
    });

    const resolvedDistrict = districtLookup?.district ?? identity.district ?? null;

    const names = identity.name.split(' ');
    const firstName = names[0] || identity.name;
    const lastName = names.slice(1).join(' ') || identity.name;

    const user = await prisma.user.upsert({
      where: { employeeId: identity.employeeId },
      update: {
        email: normalizedEmail,
        firstName,
        lastName,
        displayName: identity.name,
        homeArea: identity.homeArea ?? null,
        district: resolvedDistrict,
      },
      create: {
        employeeId: identity.employeeId,
        email: normalizedEmail,
        firstName,
        lastName,
        displayName: identity.name,
        homeArea: identity.homeArea ?? null,
        district: resolvedDistrict,
      },
    });

    await prisma.loginEvent.create({
      data: {
        userId: user.id,
        provider: 'saml',
        success: true,
      },
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL!;

    if (!identity.role) {
      console.warn('SAML ACS: user authenticated but no app role could be mapped', {
        employeeId: identity.employeeId,
        email: normalizedEmail,
        homeArea: identity.homeArea,
        district: resolvedDistrict,
      });

      return NextResponse.redirect(new URL('/unauthorized', baseUrl), { status: 303 });
    }

    
    await prisma.userRole.createMany({
      data: [{ userId: user.id, role: identity.role }],
      skipDuplicates: true,
    });

    const userWithRoles = await prisma.user.findUniqueOrThrow({
      where: { id: user.id },
      include: { userRoles: true },
    });
    const sessionRoles = Array.from(new Set(userWithRoles.userRoles.map((r) => r.role)));

    console.info('SAML ACS success', {
      employeeId: identity.employeeId,
      role: identity.role,
      homeArea: identity.homeArea,
      district: resolvedDistrict,
      districtSource: districtLookup ? 'lookup_table' : identity.district != null ? 'assertion' : 'none',
    });

    console.info('SAML ACS redirect target', {
      baseUrl,
      target: new URL('/dashboard', baseUrl).toString(),
    });

    const response = NextResponse.redirect(new URL('/dashboard', baseUrl), { status: 303 });

    await setSessionCookie(response, {
      user: {
        id: user.id,
        employeeId: identity.employeeId,
        name: identity.name,
        email: normalizedEmail,
        role: identity.role,
        roles: sessionRoles as typeof identity.role[],
        homeArea: identity.homeArea,
        district: resolvedDistrict,
      },
      samlSessionIndex: extract.sessionIndex,
    });

    return response;
  } catch (error) {
    console.error('SAML ACS failed', error);
    return NextResponse.redirect(new URL('/login?error=saml', request.url), { status: 303 });
  }
}