# Spotlight (SAML Foundation Slice)

This slice implements production-minded **real SAML SSO foundation** for Spotlight using the client-provided ForgeRock/TMNA IdP metadata.

## What this slice includes

- SP-initiated SAML login route: `GET /api/auth/saml/login`
- ACS/callback handling routes:
  - `POST /api/auth/saml/acs`
  - `POST /api/auth/saml/callback` (alias to ACS)
- Server-side assertion validation via `samlify`
- Centralized SAML attribute mapping with fallback keys
- Session creation in signed HTTP-only cookie
- Simple authenticated verification page at `/dashboard`
- Logout behavior:
  - local app session clear via `/api/auth/logout`
  - practical IdP logout redirect wiring via ForgeRock SLO endpoint (RelayState back to login)

## SAML source-of-truth values wired from provided IdP metadata

- IdP Entity ID / Issuer:
  - `https://ep.fram.qa.idm.toyota.com/Spotlight`
- IdP SSO (HTTP-Redirect):
  - `https://ep.fram.qa.idm.toyota.com/openam/SSORedirect/metaAlias/dealerdaily/Spotlight`
- IdP SLO (HTTP-Redirect):
  - `https://ep.fram.qa.idm.toyota.com/openam/IDPSloRedirect/metaAlias/dealerdaily/Spotlight`
- NameID format:
  - `urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified`
- IdP `WantAuthnRequestsSigned` respected as `false`

> `SAML_IDP_PUBLIC_CERT` must contain the exact certificate text from ForgeRock metadata.

## Session shape

The application session is normalized to:

```ts
{
  user: {
    id: string
    employeeId: string
    name: string
    email: string
    role: "uploader" | "qualifier" | "judge1" | "judge2" | "admin"
    homeArea: number | null
  }
}
```

## Environment variables

Use `.env.example` and set values as needed.

Required runtime vars:

- `APP_BASE_URL`
- `SESSION_SECRET`
- `DATABASE_URL`
- `SAML_IDP_PUBLIC_CERT` (exact cert from metadata)

SP-side configurable vars:

- `SAML_SP_ENTITY_ID` (optional; defaults to `<APP_BASE_URL>/api/auth/saml/metadata`)
- `SAML_SP_ACS_PATH` (default `/api/auth/saml/callback`)
- `SAML_SP_SLO_PATH` (default `/api/auth/saml/logout`)
- `SAML_SP_PRIVATE_KEY` / `SAML_SP_PUBLIC_CERT` (only needed when SP signing is enabled in future)

## Attribute mapping keys currently checked

- employeeId: `employeeId`, `employeeNumber`, `uid`, `urn:oid:0.9.2342.19200300.100.1.1`, `http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier`
- email: `email`, `mail`, `emailAddress`, `urn:oid:0.9.2342.19200300.100.1.3`, `http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress`
- name: `displayName`, `cn`, `name`, `http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name`
- role: `role`, `roles`, `groups`, `memberOf`, `http://schemas.microsoft.com/ws/2008/06/identity/claims/role`
- homeArea: `homeArea`, `home_area`, `area`, `dealerArea`, `regionCode`

Each group is overrideable by env variables (`SAML_ATTR_*`).

## Local test steps

1. `cp .env.example .env`
2. Fill `DATABASE_URL`, `SESSION_SECRET`, and exact `SAML_IDP_PUBLIC_CERT`.
3. `npm install`
4. `npm run prisma:generate`
5. `npm run prisma:migrate`
6. `npm run dev`
7. Open `http://localhost:3000/login`.
8. Click **Continue with SAML SSO**.
9. After successful IdP auth, confirm `/dashboard` shows signed-in status and normalized fields.
10. Click **Sign out** and confirm session clears and redirect returns to login.

## Stage notes / TODOs to confirm with ForgeRock team

1. Exact outgoing attribute names for employeeId, role, and homeArea.
2. Whether ForgeRock expects/needs SP metadata from Spotlight for final setup.
3. Whether SP-signed AuthnRequests will be required in higher environments.
4. Whether strict full SLO (request/response validation both ways) is launch-critical, or redirect-based practical logout is sufficient for phase 1.
