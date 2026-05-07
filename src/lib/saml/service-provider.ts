import * as samlify from 'samlify';
import * as validator from '@authenio/samlify-node-xmllint';

import { getSamlConfig } from './config';

samlify.setSchemaValidator(validator);

export function createServiceProvider() {
  const cfg = getSamlConfig();

  return samlify.ServiceProvider({
    entityID: cfg.spEntityId,
    authnRequestsSigned: Boolean(cfg.SAML_SP_PRIVATE_KEY && cfg.SAML_SP_PUBLIC_CERT),
    privateKey: cfg.SAML_SP_PRIVATE_KEY,
    signingCert: cfg.SAML_SP_PUBLIC_CERT,
    assertionConsumerService: [
      {
        Binding: samlify.Constants.namespace.binding.post,
        Location: cfg.spAcsUrl,
      },
    ],
    singleLogoutService: [
      {
        Binding: samlify.Constants.namespace.binding.redirect,
        Location: cfg.spSloUrl,
      },
    ],
    nameIDFormat: ['urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified'],
    wantAssertionsSigned: true,
  });
}

export function createIdentityProvider() {
  const cfg = getSamlConfig();

  return samlify.IdentityProvider({
    entityID: cfg.SAML_IDP_ENTITY_ID,
    wantAuthnRequestsSigned: true,
    singleSignOnService: [
      {
        Binding: samlify.Constants.namespace.binding.redirect,
        Location: cfg.SAML_IDP_SSO_URL,
      },
    ],
    singleLogoutService: [
      {
        Binding: samlify.Constants.namespace.binding.redirect,
        Location: cfg.SAML_IDP_SLO_URL,
      },
    ],
    signingCert: cfg.SAML_IDP_PUBLIC_CERT,
  });
}
