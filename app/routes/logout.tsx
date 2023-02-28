import { redirect } from '@remix-run/node';
import { getUsername } from '~/session.server';

import type { ActionArgs } from '@remix-run/node';
import { createLogoutRequest } from '~/lib/saml.server';

export const action = async ({ request }: ActionArgs) => {
  const user = await getUsername(request);

  // Do the opposite of login
  if (user) {
    const context = createLogoutRequest(user);
    return redirect(context);
  }
};

export const loader = async () => {
  return redirect('/');
};
