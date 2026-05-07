import { z } from 'zod';

const FORGEROCK_IDP_ENTITY_ID = 'https://ep.fram.qa.idm.toyota.com/Spotlight';
const FORGEROCK_SSO_REDIRECT_URL = 'https://ep.fram.qa.idm.toyota.com/openam/SSORedirect/metaAlias/dealerdaily/Spotlight';
const FORGEROCK_SLO_REDIRECT_URL = 'https://ep.fram.qa.idm.toyota.com/openam/IDPSloRedirect/metaAlias/dealerdaily/Spotlight';

const envSchema = z.object({
  APP_BASE_URL: z.string().url(),
  SAML_SP_ENTITY_ID: z.string().url().optional(),
  SAML_SP_ACS_PATH: z.string().default('/api/auth/saml/acs'),
  SAML_SP_SLO_PATH: z.string().default('/api/auth/saml/logout'),
  SAML_SP_PRIVATE_KEY: z.string().optional().default(''),
  SAML_SP_PUBLIC_CERT: z.string().optional().default(''),

  SAML_IDP_ENTITY_ID: z.string().default(FORGEROCK_IDP_ENTITY_ID),
  SAML_IDP_SSO_URL: z.string().url().default(FORGEROCK_SSO_REDIRECT_URL),
  SAML_IDP_SLO_URL: z.string().url().default(FORGEROCK_SLO_REDIRECT_URL),
  SAML_IDP_PUBLIC_CERT: z.string().min(1, 'SAML_IDP_PUBLIC_CERT must contain the ForgeRock metadata certificate.'),

  SAML_ATTR_EMPLOYEE_ID: z.string().optional().default('employeeId'),
  SAML_ATTR_EMAIL: z.string().optional().default('email'),
  SAML_ATTR_NAME: z.string().optional().default('displayName'),
  SAML_ATTR_ROLE: z.string().optional().default('role'),
  SAML_ATTR_HOME_AREA: z.string().optional().default('homeArea'),
});

export type SamlEnvConfig = z.infer<typeof envSchema>;

export type ResolvedSamlConfig = SamlEnvConfig & {
  spEntityId: string;
  spAcsUrl: string;
  spSloUrl: string;
};

export function getSamlConfig(): ResolvedSamlConfig {
  const cfg = envSchema.parse(process.env);
  const baseUrl = new URL(cfg.APP_BASE_URL);

  const spAcsUrl = new URL(cfg.SAML_SP_ACS_PATH, baseUrl).toString();
  const spSloUrl = new URL(cfg.SAML_SP_SLO_PATH, baseUrl).toString();
  const spEntityId = cfg.SAML_SP_ENTITY_ID ?? new URL('/api/auth/saml/metadata', baseUrl).toString();

  return {
    ...cfg,
    spEntityId,
    spAcsUrl,
    spSloUrl,
  };
}
