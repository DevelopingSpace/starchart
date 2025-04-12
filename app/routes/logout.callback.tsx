import type { LoaderFunctionArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { logout } from '~/session.server';

// Logout, destroying the session with Starchart
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  const SAMLResponse = url.searchParams.get('SAMLResponse');

  if (SAMLResponse) {
    return await logout(request);
  }
  return redirect('/');
};
