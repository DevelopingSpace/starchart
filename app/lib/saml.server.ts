// saml server based on following PR
// https://github.com/remix-run/examples/pull/130/files/ec66b3060fac83eec2389eb0c96aad6d8ea4aed1#diff-02d2b71e481b2495b8a72af14f09fc28238298c7f1d19a540e37c9228985b0da
import * as samlify from 'samlify';
import * as validator from '@authenio/samlify-node-xmllint';

samlify.setSchemaValidator(validator);

const { SAML_IDP_METADATA_URL } = process.env;
if (!SAML_IDP_METADATA_URL) {
  throw new Error('Missing SAML_IDP_METADATA_URL environment variable');
}
// Download the IDP's XML Metadata and use it to create our IdentityProvider
// NOTE: we purposely let this run in the background at startup, and then
// reuse the await'ed result whenever we need to use it below (only the first).
// If it fails for some reason, we'll crash the server (which is what we want
// since auth can't work without this metadata and the IdP being loaded).
const idp = fetch(SAML_IDP_METADATA_URL)
  .then((res) => {
    if (!res.ok) {
      throw new Error(
        `Unable to read SAML IdP metadata from SAML_IDP_METADATA_URL=${SAML_IDP_METADATA_URL}: status code=${res.status}`
      );
    }
    return res.text();
  })
  .then((metadata) =>
    samlify.IdentityProvider({
      metadata,
    })
  );

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

export function metadata() {
  return sp.getMetadata();
}

export async function createLoginRequest(redirectUrl: string = '/') {
  const { context } = sp.createLoginRequest(await idp, 'redirect');
  const url = new URL(context);
  url.searchParams.append('RelayState', redirectUrl);
  return url.href;
}

export async function createLogoutRequest(user: string) {
  const { context } = sp.createLogoutRequest(await idp, 'redirect', { nameID: user });
  return context;
}

export async function parseLoginResponse(body: { [k: string]: FormDataEntryValue }) {
  const { extract } = await sp.parseLoginResponse(await idp, 'post', {
    body,
  });
  const relayState = body.RelayState as string;
  return { samlResponse: extract, relayState };
}
