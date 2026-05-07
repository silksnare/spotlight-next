import type { AppRole } from '@/lib/auth/roles';
import { normalizeRole } from '@/lib/auth/roles';

import { getSamlConfig } from './config';

type RawAssertionAttributes = Record<string, unknown>;

export type NormalizedSamlUser = {
  employeeId: string;
  name: string;
  email: string;
  role: AppRole | null;
  homeArea: number | null;
  district: number | null;
};

// Real uploader job code from assertion
const UPLOADER_JOB_CODE = '012';
const UPLOADER_REGION_CODES = ['31', '32', '33', '34'];

// Placeholder arbitrary job code for BIW qualifier + round 1 judge users
const QUALIFIER_JOB_CODE = '';

// Replace these with real emails
const CLIENT_ADMIN_EMAILS = [
  'gary.zimmer@lexus.com',
  'michael.zimmerman@lexus.com',
  'kathy.wachs@lexus.com',
  'scott.murphy@lexus.com',
  'SPOTLIGHT_CORP1@TMNATEST.COM',
];

const JUDGE2_EMAILS = [
  'joseph.mullan@lexus.com',
  'myra.tretter@lexus.com',
  'david.tourtlotte@lexus.com',
  'bonier.avila@lexus.com',
  'hugh.dyer@lexus.com',
  'violet.szeliga@lexus.com',
  'erik.fischer@lexus.com',
  'kyle.pippitt@lexus.com',
  'matthew.baranek@lexus.com',
  'michael.boyland@lexus.com',
  'patricia.lehmam@lexus.com',
  'robert.bolden@lexus.com',
  // Temporary test users for Round 2 validation
  // 'SPOTLIGHT_DEALER_R31@tmnatest.com',
  // 'SPOTLIGHT_DEALER_R31_1@tmnatest.com',
  // 'SPOTLIGHT_DEALER_R32@tmnatest.com',
  // 'SPOTLIGHT_DEALER_R32_1@tmnatest.com',
  // 'SPOTLIGHT_DEALER_R33@tmnatest.com',
  // 'SPOTLIGHT_DEALER_R33_1@tmnatest.com',
  // 'SPOTLIGHT_DEALER_R34@tmnatest.com',
  'SPOTLIGHT_DEALER_R34_1@tmnatest.com',
];

function firstString(value: unknown): string {
  if (Array.isArray(value)) return String(value[0] ?? '').trim();
  if (value == null) return '';
  return String(value).trim();
}

function readFirst(attributes: RawAssertionAttributes, keys: string[]): string {
  for (const key of keys) {
    const candidate = firstString(attributes[key]);
    if (candidate) return candidate;
  }

  return '';
}

function toHomeArea(rawValue: string): number | null {
  if (!rawValue) return null;

  const parsed = Number.parseInt(rawValue, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function toDistrict(rawValue: string): number | null {
  if (!rawValue) return null;

  const parsed = Number.parseInt(rawValue, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function emailInList(email: string, allowedEmails: string[]): boolean {
  if (!email) return false;

  const normalized = normalizeEmail(email);
  return allowedEmails.some((candidate) => normalizeEmail(candidate) === normalized);
}

function resolveAppRole(params: {
  dealerPrimaryJobCode: string;
  dealerRegionCode: string;
  email: string;
  rawRole: string;
}): AppRole | null {
  const { dealerPrimaryJobCode, dealerRegionCode, email, rawRole } = params;

  if (emailInList(email, CLIENT_ADMIN_EMAILS)) {
    return 'admin';
  }

  if (emailInList(email, JUDGE2_EMAILS)) {
    return 'judge2';
  }

  if (
    dealerPrimaryJobCode === UPLOADER_JOB_CODE &&
    UPLOADER_REGION_CODES.includes(dealerRegionCode)
  ) {
    return 'uploader';
  }

  if (dealerPrimaryJobCode === QUALIFIER_JOB_CODE) {
    return 'qualifier';
  }

  return normalizeRole(rawRole) ?? null;
}

export function normalizeSamlIdentity(attributes: RawAssertionAttributes): NormalizedSamlUser {
  const cfg = getSamlConfig();

  const employeeId = readFirst(attributes, [
    cfg.SAML_ATTR_EMPLOYEE_ID,
    'employeeId',
    'employeeNumber',
    'uid',
    'urn:oid:0.9.2342.19200300.100.1.1',
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier',
  ]);

  const email = readFirst(attributes, [
    cfg.SAML_ATTR_EMAIL,
    'email',
    'mail',
    'emailAddress',
    'urn:oid:0.9.2342.19200300.100.1.3',
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
  ]);

  const name = readFirst(attributes, [
    cfg.SAML_ATTR_NAME,
    'displayName',
    'cn',
    'name',
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name',
  ]);

  const rawRole = readFirst(attributes, [
    cfg.SAML_ATTR_ROLE,
    'role',
    'roles',
    'groups',
    'memberOf',
    'http://schemas.microsoft.com/ws/2008/06/identity/claims/role',
  ]);

  const dealerPrimaryJobCode = readFirst(attributes, ['Dealer Primary JobCode']);

  const dealerRegionCode = readFirst(attributes, ['Dealer Region Code']);

  const normalizedRole = resolveAppRole({
    dealerPrimaryJobCode,
    dealerRegionCode,
    email,
    rawRole,
  });

  const rawHomeArea = readFirst(attributes, [
    cfg.SAML_ATTR_HOME_AREA,
    'homeArea',
    'home_area',
    'area',
    'dealerArea',
    'regionCode',
    'Dealer Region Code',
  ]);

  const homeArea = toHomeArea(rawHomeArea);

  const rawDistrict = readFirst(attributes, [
    'district',
    'District',
    'dealerDistrict',
    'dealer_district',
  ]);

  const district = toDistrict(rawDistrict);

  if (!employeeId) {
    console.warn('SAML attribute mapping: missing employeeId from assertion', {
      availableAttributes: Object.keys(attributes),
    });
  }

  if (!email) {
    console.warn('SAML attribute mapping: missing email from assertion', {
      availableAttributes: Object.keys(attributes),
    });
  }

  if (!name) {
    console.warn('SAML attribute mapping: missing display name from assertion', {
      availableAttributes: Object.keys(attributes),
    });
  }

  if (!normalizedRole) {
    console.warn('SAML attribute mapping: could not determine app role from assertion', {
      employeeId,
      email,
      rawRole,
      dealerPrimaryJobCode,
      dealerRegionCode,
      availableAttributes: Object.keys(attributes),
    });
  }

  return {
    employeeId,
    email,
    name: name || email || employeeId,
    role: normalizedRole,
    homeArea,
    district,
  };
}