import { redirect } from '@remix-run/node';
import { getUsername, logout } from '~/session.server';

import type { ActionArgs } from '@remix-run/node';

export const action = async ({ request }: ActionArgs) => {
  const user = await getUsername(request);

  // Invalidate the Starchart session but do not log out from Seneca IDP.
  if (user) {
    return logout(request);
  }
  return redirect('/');
};

export const loader = async () => {
  return redirect('/');
};
