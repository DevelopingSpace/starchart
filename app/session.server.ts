import { createCookie, createCookieSessionStorage, redirect } from '@remix-run/node';

import { isAdmin, getUserByUsername } from '~/models/user.server';
import secrets from '~/lib/secrets.server';

import type { User } from '~/models/user.server';
import logger from './lib/logger.server';

if (!secrets.SESSION_SECRET?.length) {
  throw new Error('SESSION_SECRET must be set');
}

if (!process.env.APP_URL) {
  throw new Error('APP_URL Env Var not set.');
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

export async function getEffectiveUsername(
  request: Request
): Promise<User['username'] | undefined> {
  const cookie = request.headers.get('Cookie');
  const effectiveUsername = await effectiveUsernameCookie.parse(cookie);
  return effectiveUsername as User['username'];
}

export async function getEffectiveUser(request: Request) {
  // get the effective username in the cookie at the time
  const [username, effectiveUsername] = await Promise.all([
    getUsername(request),
    getEffectiveUsername(request),
  ]);

  if (!username) {
    return null;
  }

  // if the user doesn't have an effective username,
  // we're using their normal username (not impersonating)
  let user;
  if (!effectiveUsername) {
    user = await getUserByUsername(username);
  } else {
    user = await getUserByUsername(effectiveUsername);
  }

  if (user) {
    return user;
  }

  throw await logout(request);
}

/**
 * @param username the user's actual username
 * @param effectiveUsername [optional] when a `string`, this is a different
 * username that an admin is impersonating. If `null`, we are explicitly
 * clearing a previous impersonation session. If `undefined`, the user is
 * logging in (new session) and there is no effectiveUsername (yet).
 * @returns Promise<string>
 */
export async function setEffectiveUsername(
  username: string,
  effectiveUsername?: string | null
): Promise<string> {
  // Only admins can impersonate. Regular users can only be themselves
  if (!(await isAdmin(username))) {
    return await effectiveUsernameCookie.serialize(username);
  }

  // This is an admin user, figure out what to do based on effectiveUsername.
  switch (effectiveUsername) {
    /* Existing session, so we're ending impersonation */
    case null:
      logger.info(`Admin (${username}) ending impersonation`);
    // falls through

    /* New or Lost Session  */
    case undefined:
      // (re)set the effectiveUsername to null
      return await effectiveUsernameCookie.serialize(null);

    /* Starting impersonation of specified user */
    default:
      logger.info(`Admin (${username}) started impersonating user: ${effectiveUsername}`);
      return await effectiveUsernameCookie.serialize(effectiveUsername);
  }
}

export async function getUser(request: Request) {
  const username = await getUsername(request);

  if (!username) {
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
  const [username, effectiveUsername] = await Promise.all([
    getUsername(request),
    getEffectiveUsername(request),
  ]);

  if (!username) {
    const searchParams = new URLSearchParams([['redirectTo', redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }

  return effectiveUsername || username;
}

export async function requireUser(request: Request) {
  const username = await requireUsername(request);

  const user = await getUserByUsername(username);
  if (user) {
    return user;
  }

  throw await logout(request);
}

export async function requireAdmin(request: Request) {
  const username = await requireUsername(request);
  const user = await getUserByUsername(username);

  if (user?.isAdmin) {
    return user;
  }
  throw redirect('/');
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

  const headers = new Headers();

  headers.append('Set-Cookie', await setEffectiveUsername(username));

  headers.append(
    'Set-Cookie',
    await sessionStorage.commitSession(session, {
      maxAge: remember
        ? 60 * 60 * 24 * 7 // 7 days
        : undefined,
    })
  );

  return redirect(redirectTo, {
    headers,
  });
}

export async function logout(request: Request, redirectTo?: string) {
  const session = await getSession(request);
  const username = await getUsername(request);
  const effectiveUsername = await getEffectiveUsername(request);

  const headers = new Headers();
  headers.append('Set-Cookie', await sloUsernameCookie.serialize(session.get(USER_SESSION_KEY)));
  headers.append('Set-Cookie', await sessionStorage.destroySession(session));

  // If we're impersonating another user, finish that first and log it
  if (username && effectiveUsername) {
    headers.append('Set-Cookie', await setEffectiveUsername(username, null));
  } else {
    headers.append('Set-Cookie', await effectiveUsernameCookie.serialize(null));
  }

  return redirect(redirectTo ? redirectTo : '/', {
    headers,
  });
}

export async function startImpersonation(request: Request, newUsername: string) {
  const { username } = await requireAdmin(request);

  return redirect('/', {
    headers: {
      'Set-Cookie': await setEffectiveUsername(username, newUsername),
    },
  });
}

export async function stopImpersonation(request: Request) {
  const username = await getUsername(request);
  if (username) {
    return redirect('/', {
      headers: {
        'Set-Cookie': await setEffectiveUsername(username, null),
      },
    });
  }

  return redirect('/');
}

export const sloUsernameCookie = createCookie('sloUsername', {
  domain: process.env.NODE_ENV === 'production' ? new URL(process.env.APP_URL).hostname : undefined,
  path: '/logout',
  sameSite: 'strict',
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  /* An Hour before sloUsername Cookie Expires, after which logout will
     redirect to session-less sign-in button page */
  maxAge: 60 * 60,
});

export const effectiveUsernameCookie = createCookie('effectiveUsername', {
  domain: process.env.NODE_ENV === 'production' ? new URL(process.env.APP_URL).hostname : undefined,
  sameSite: 'strict',
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  /* A week same as session if remembered */
  maxAge: 60 * 60 * 24 * 7, // 7 days
});
