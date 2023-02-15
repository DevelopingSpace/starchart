import { redirect } from '@remix-run/node';
import { getUsername } from '~/session.server';

import type { ActionArgs } from '@remix-run/node';
import { getIdp, sp } from '~/saml.server';

export const action = async ({ request }: ActionArgs) => {
  const user = await getUsername(request);

  //Do the opposite of login
  const idp = await getIdp();
  const { context } = sp.createLogoutRequest(idp, 'redirect', { nameID: user });
  return redirect(context);
};

export const loader = async () => {
  return redirect('/');
};
