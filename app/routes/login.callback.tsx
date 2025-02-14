import type { ActionFunctionArgs } from '@remix-run/node';
import { createUserSession } from '~/session.server';
import { parseLoginResponse } from '~/lib/saml.server';
import { redirect } from '@remix-run/node';
import { createUser, checkUsernameExists } from '~/models/user.server';

/* This is the post route that the SAML response is bound to. It comes back as formData.
  We attempt to extract the SAML response into a json format that we can then use:

The response from SimpleSAMLPhp
{
  conditions: {
    notBefore: '2023-02-16T17:09:02Z',
    notOnOrAfter: '2023-02-16T17:14:32Z'
  },
  response: {
    id: '_cb60d5bbb95d8c820bbb306640ea535e9ffd6f23ca',
    issueInstant: '2023-02-16T17:09:32Z',
    destination: 'http://localhost:8080/login/callback',
    inResponseTo: '_4be46ad1-4c2c-42c7-ba1f-a23c31161fcd'
  },
  audience: 'http://host.docker.internal:8080/sp',
  issuer: 'http://localhost:8081/simplesaml/saml2/idp/metadata.php',
  nameID: 'user1@myseneca.ca',
  sessionIndex: {
    authnInstant: '2023-02-16T17:09:32Z',
    sessionNotOnOrAfter: '2023-02-17T01:09:32Z',
    sessionIndex: '_6befc9246d7bd30b9e0faea72d0836cddf3ff8d556'
  },
  attributes: {
    uid: '1',
    eduPersonAffiliation: 'group1',
    email: 'user1@myseneca.ca',
    displayname: 'Johannes Kepler'
    sAMAccountName: 'user1',
    group:'mycustomdomain-dev-students',
  }
}
*/
export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method !== 'POST') {
    // Request method is not post, why are you here?
    return redirect('/');
  }

  const formData = await request.formData();
  const body = Object.fromEntries(formData);
  const { samlResponse, relayState } = await parseLoginResponse(body);
  // Try and extract the username and see if there is an existing user by that name
  if (!samlResponse.attributes.sAMAccountName) {
    // TODO: Make this redirect to access denied page
    return redirect('/');
  }
  const returnTo = relayState ? relayState : '/';
  const username = samlResponse.attributes.sAMAccountName;

  // If this user has never logged in before, add to our system
  if (!(await checkUsernameExists(username))) {
    await createUser(
      username,
      samlResponse.attributes.displayname,
      samlResponse.attributes.email,
      Array.isArray(samlResponse.attributes.group)
        ? samlResponse.attributes.group.join(',')
        : samlResponse.attributes.group
    );
  }

  // Either way create a session
  return createUserSession({
    request: request,
    username: username,
    remember: false,
    redirectTo: returnTo,
  });
};
