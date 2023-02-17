import type { ActionArgs } from '@remix-run/node';
import { createUserSession } from '~/session.server';
import { sp, getIdp } from '~/saml.server';
import { redirect } from '@remix-run/node';
import { createUser, getUserByUsername } from '~/models/user.server';

//This is the post route that the SAML response is bound to. It comes back as formData.
//We attempt to extract the SAML response into a json format that we can then use:
/*
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
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress': 'user1@myseneca.ca',
    email: 'user1@myseneca.ca',
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname': 'Johannes',
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname': 'Kepler',
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name': 'user1@myseneca.ca',
    sAMAccountName: 'user1',
    'http://schemas.microsoft.com/identity/claims/displayname': 'Johannes Kepler'
  }
}
*/
export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();

  if (request.method == 'POST') {
    const body = Object.fromEntries(formData);
    const idp = await getIdp();
    const { extract } = await sp.parseLoginResponse(idp, 'post', {
      body: body,
    });

    //Try and extract the username and see if there is an existing user by that name
    if (extract.nameID) {
      const username = extract.nameID;
      // get or create user
      let user = await getUserByUsername(username);

      //If not create one
      if (!user) {
        user = await createUser(
          username,
          extract.attributes['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname'],
          extract.attributes['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname'],
          extract.attributes['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress']
        );
      }

      //Either way create a session
      return createUserSession({
        request: request,
        username: username,
        remember: false,
        redirectTo: '/',
      });
    }

    // return to access denied if redirect in createUserSession did not take
    return redirect('/access_denied');
  } else {
    //Request method is not post, why are you here?
    return redirect('/');
  }
};
