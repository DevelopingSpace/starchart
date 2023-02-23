// saml server based on following PR
// https://github.com/remix-run/examples/pull/130/files/ec66b3060fac83eec2389eb0c96aad6d8ea4aed1#diff-02d2b71e481b2495b8a72af14f09fc28238298c7f1d19a540e37c9228985b0da
import * as samlify from 'samlify';
import * as validator from '@authenio/samlify-node-xmllint';
import secrets from './lib/secrets.server';

samlify.setSchemaValidator(validator);

const { SAML_IDP_METADATA } = secrets;
if (!SAML_IDP_METADATA) {
  throw new Error('Missing SAML_IDP_METADATA secret');
}

// Here we configure the service provider: https://samlify.js.org/#/sp-configuration

const sp = samlify.ServiceProvider({
  entityID: process.env.SAML_ENTITY_ID,
  nameIDFormat: ['urn:oasis:names:tc:SAML:2.0:nameid-format:persistent'],
  wantAssertionsSigned: true,
  assertionConsumerService: [
    {
      Binding: 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST',
      Location: process.env.HOSTNAME + '/login/callback',
    },
  ],
  singleLogoutService: [
    {
      Binding: 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST',
      Location: process.env.HOSTNAME + '/logout/callback',
    },
  ],
});

// Take the metadata stood up by the IDP and use it as the metadata for our IDP object
const idp = samlify.IdentityProvider({
  metadata: SAML_IDP_METADATA,
});

export function metadata() {
  return sp.getMetadata();
}

export async function createLoginRequest(url?: URL) {
  const { context } = sp.createLoginRequest(idp, 'redirect');
  const returnTo = url ? url.searchParams.get('redirectTo') : '/';
  return context + '&RelayState=' + returnTo;
}

export async function createLogoutRequest(user: string) {
  const { context } = sp.createLogoutRequest(idp, 'redirect', { nameID: user });
  return context;
}

export async function parseLoginResponse(body: { [k: string]: FormDataEntryValue }) {
  const { extract } = await sp.parseLoginResponse(idp, 'post', {
    body,
  });
  return extract;
}
