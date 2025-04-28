import type { LoaderFunctionArgs } from '@remix-run/node';
import { metadata } from '~/lib/saml.server';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function loader({ params }: LoaderFunctionArgs) {
  const meta = metadata();
  return new Response(meta, {
    status: 200,
    headers: {
      'Content-Type': 'text/xml',
    },
  });
}
