import { createCookieSessionStorage, redirect } from '@remix-run/node';

import type { User } from '~/models/user.server';
import { getUserByUsername } from '~/models/user.server';
import secrets from '~/lib/secrets.server';

if (!secrets.SESSION_SECRET?.length) {
  throw new Error('SESSION_SECRET must be set');
}

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: '__session',
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secrets: [secrets.SESSION_SECRET],
    secure: process.env.NODE_ENV === 'production',
  },
});

const USER_SESSION_KEY = 'username';

export async function getSession(request: Request) {
  const cookie = request.headers.get('Cookie');
  return sessionStorage.getSession(cookie);
}

export async function getUsername(request: Request): Promise<User['username'] | undefined> {
  const session = await getSession(request);
  const username = session.get(USER_SESSION_KEY);
  return username;
}

export async function getUser(request: Request) {
  const username = await getUsername(request);
  if (username === undefined) {
    return null;
  }

  const user = await getUserByUsername(username);
  if (user) {
    return user;
  }

  throw await logout(request);
}

export async function requireUsername(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) {
  const username = await getUsername(request);
  if (!username) {
    const searchParams = new URLSearchParams([['redirectTo', redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }
  return username;
}

export async function requireUser(request: Request) {
  const username = await requireUsername(request);

  const user = await getUserByUsername(username);
  if (user) {
    return user;
  }

  throw await logout(request);
}

export async function createUserSession({
  request,
  username,
  remember,
  redirectTo,
}: {
  request: Request;
  username: string;
  remember: boolean;
  redirectTo: string;
}) {
  const session = await getSession(request);
  session.set(USER_SESSION_KEY, username);
  return redirect(redirectTo, {
    headers: {
      'Set-Cookie': await sessionStorage.commitSession(session, {
        maxAge: remember
          ? 60 * 60 * 24 * 7 // 7 days
          : undefined,
      }),
    },
  });
}

export async function logout(request: Request) {
  const session = await getSession(request);
  return redirect('/', {
    headers: {
      'Set-Cookie': await sessionStorage.destroySession(session),
    },
  });
}
