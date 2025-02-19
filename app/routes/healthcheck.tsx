import { json } from '@remix-run/server-runtime';

import { redis } from '~/lib/redis.server';
import { prisma } from '~/db.server';

import type { LoaderArgs } from '@remix-run/server-runtime';

export async function loader({ request }: LoaderArgs) {
  const host = request.headers.get('X-Forwarded-Host') ?? request.headers.get('host');

  try {
    const url = new URL('/', `http://${host}`);
    // if we can connect to the databases and make a simple query
    // and make a HEAD request to ourselves, then we're good.
    await Promise.all([
      redis.ping(),
      prisma.user.count(),
      fetch(url.toString(), { method: 'HEAD' }).then((r) => {
        if (!r.ok) {
          return Promise.reject(r);
        }
      }),
    ]);
    return json({ status: 'ok ' });
  } catch {
    return json({ status: 'error' }, { status: 500 });
  }
}
