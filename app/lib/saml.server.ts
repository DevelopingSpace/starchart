// saml server based on following PR
// https://github.com/remix-run/examples/pull/130/files/ec66b3060fac83eec2389eb0c96aad6d8ea4aed1#diff-02d2b71e481b2495b8a72af14f09fc28238298c7f1d19a540e37c9228985b0da
import * as samlify from 'samlify';
import * as validator from '@authenio/samlify-node-xmllint';
import { readFileSync } from 'fs';

samlify.setSchemaValidator(validator);

// Use the data in config/idp-metadata.xml (or wherever SAML_IDP_METADATA_PATH points)
let xml: string;
const xmlPath = process.env.SAML_IDP_METADATA_PATH || 'config/idp-metadata-dev.xml';
try {
  xml = readFileSync(xmlPath, 'utf-8');
} catch (err) {
  throw new Error(`Unable to load ${xmlPath} for SAML IDP metadata: ${(err as Error).message}`);
}
const idp = samlify.IdentityProvider({
  metadata: xml,
});

const { HOSTNAME } = process.env;

/**
 * We require the hostname or can't configure SAML.
 */
if (!HOSTNAME) {
  throw new Error('HOSTNAME environment variable is missing');
}

// Here we configure the service provider: https://samlify.js.org/#/sp-configuration
const sp = samlify.ServiceProvider({
  entityID: new URL('/sp', HOSTNAME).href,
  nameIDFormat: ['urn:oasis:names:tc:SAML:2.0:nameid-format:persistent'],
  wantAssertionsSigned: true,
  assertionConsumerService: [
    {
      Binding: 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST',
      Location: new URL('/login/callback', HOSTNAME).href,
    },
  ],
  singleLogoutService: [
    {
      Binding: 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST',
      Location: new URL('/logout/callback', HOSTNAME).href,
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

export async function parseLoginResponse(body: { [k: string]: FormDataEntryValue }) {
  const { extract } = await sp.parseLoginResponse(idp, 'post', {
    body,
  });
  const relayState = body.RelayState as string;
  return { samlResponse: extract, relayState };
}
