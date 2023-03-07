// saml server based on following PR
// https://github.com/remix-run/examples/pull/130/files/ec66b3060fac83eec2389eb0c96aad6d8ea4aed1#diff-02d2b71e481b2495b8a72af14f09fc28238298c7f1d19a540e37c9228985b0da
import * as samlify from 'samlify';
import * as validator from '@authenio/samlify-node-xmllint';

import logger from './logger.server';

import type { IdentityProvider } from 'samlify/types/src/entity-idp';

samlify.setSchemaValidator(validator);

let idp: IdentityProvider;

// this is needed because in development we don't want to restart
// the server with every change, but we want to reuse the already
// initialized idp that we created at startup, and cached on the global.
declare global {
  var __idp__: IdentityProvider;
}
if (process.env.NODE_ENV !== 'production') {
  idp = global.__idp__;
}

/**
 * Make sure we have the required IdP metadata URL, and use it
 * to initialize our IdentityProvider instance. Because we
 * have to download this file, we only want to do this once
 * on startup. In development, we cache the `idp` value.
 */
export async function init() {
  const { SAML_IDP_METADATA_URL } = process.env;
  if (!SAML_IDP_METADATA_URL) {
    throw new Error('Missing SAML_IDP_METADATA_URL environment variable');
  }

  // Download the IDP's XML Metadata and use it to create our IdentityProvider
  logger.debug(`SAML init: downloading IdP metadata from ${SAML_IDP_METADATA_URL}`);
  try {
    const res = await fetch(SAML_IDP_METADATA_URL);
    if (!res.ok) {
      throw new Error(
        `Unable to read SAML IdP metadata from SAML_IDP_METADATA_URL=${SAML_IDP_METADATA_URL}: status code=${res.status}`
      );
    }
    const metadata = await res.text();

    // Use the IdP's metadata to the setup
    idp = samlify.IdentityProvider({
      metadata,
    });

    // Cache this instance in development so it survives hot-reloads
    if (process.env.NODE_ENV !== 'production') {
      global.__idp__ = idp;
    }
  } catch (err) {
    logger.error(`SAML init error`, err);
    throw err;
  }
}

// Here we configure the service provider: https://samlify.js.org/#/sp-configuration
const sp = samlify.ServiceProvider({
  entityID: process.env.SAML_ENTITY_ID,
  nameIDFormat: ['urn:oasis:names:tc:SAML:2.0:nameid-format:persistent'],
  wantAssertionsSigned: true,
  assertionConsumerService: [
    {
      Binding: 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST',
      Location: '/login/callback',
    },
  ],
  singleLogoutService: [
    {
      Binding: 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST',
      Location: '/logout/callback',
    },
  ],
});

export function metadata() {
  return sp.getMetadata();
}

export function createLoginRequest(redirectUrl: string = '/') {
  const { context } = sp.createLoginRequest(idp, 'redirect');
  const url = new URL(context);
  url.searchParams.append('RelayState', redirectUrl);
  return url.href;
}

export function createLogoutRequest(user: string) {
  const { context } = sp.createLogoutRequest(idp, 'redirect', { nameID: user });
  return context;
}

export async function parseLoginResponse(body: { [k: string]: FormDataEntryValue }) {
  const { extract } = await sp.parseLoginResponse(await idp, 'post', {
    body,
  });
  const relayState = body.RelayState as string;
  return { samlResponse: extract, relayState };
}
