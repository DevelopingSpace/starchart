import { redirect } from '@remix-run/node';
import { getUsername, logout } from '~/session.server';

import type { ActionArgs } from '@remix-run/node';

export const action = async ({ request }: ActionArgs) => {
  const user = await getUsername(request);

  // Do the opposite of login
  if (user) {
    return await logout(request);
  }
  return redirect('/');
};

export const loader = async () => {
  return redirect('/');
};
