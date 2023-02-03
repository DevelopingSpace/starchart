import { redirect } from '@remix-run/node';
import { logout } from '~/session.server';

import type { ActionArgs } from '@remix-run/node';

export const action = async ({ request }: ActionArgs) => {
  return logout(request);
};

export const loader = async () => {
  return redirect('/');
};
