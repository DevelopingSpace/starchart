import type { LoaderArgs } from '@remix-run/node';
import { metadata } from '~/lib/saml.server';

export async function loader({ params }: LoaderArgs) {
  const meta = metadata();
  return new Response(meta, {
    status: 200,
    headers: {
      'Content-Type': 'text/xml',
    },
  });
}
