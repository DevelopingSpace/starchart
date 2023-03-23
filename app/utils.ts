import { useMatches } from '@remix-run/react';
import { useMemo } from 'react';

import type { Job } from 'bullmq';
import type { User as PrismaUser } from '@prisma/client';
import type { User } from '~/models/user.server';

const DEFAULT_REDIRECT = '/';

/**
 * This should be used any time the redirect path is user-provided
 * (Like the query string on our login/signup pages). This avoids
 * open-redirect vulnerabilities.
 * @param {string} to The redirect destination
 * @param {string} defaultRedirect The redirect to use if the to is unsafe.
 */
export function safeRedirect(
  to: FormDataEntryValue | string | null | undefined,
  defaultRedirect: string = DEFAULT_REDIRECT
) {
  if (!to || typeof to !== 'string') {
    return defaultRedirect;
  }

  if (!to.startsWith('/') || to.startsWith('//')) {
    return defaultRedirect;
  }

  return to;
}

/**
 * This base hook is used in other hooks to quickly search for specific data
 * across all loader data using useMatches.
 * @param {string} id The route id
 * @returns {JSON|undefined} The router data or undefined if not found
 */
export function useMatchesData(id: string): Record<string, unknown> | undefined {
  const matchingRoutes = useMatches();
  const route = useMemo(
    () => matchingRoutes.find((route) => route.id === id),
    [matchingRoutes, id]
  );
  return route?.data;
}

function isUser(user: any): user is User {
  return user && typeof user === 'object' && typeof user.email === 'string';
}

/**
 * Remove invalid/unwanted characters from a username. In the case
 * of faculty/admins, we will have a `.` in the username, which we
 * don't want to use as part of domain names.
 * @param username The user's username (e.g., `jsmith` or `john.smith`)
 */
function cleanUsername(username: PrismaUser['username']) {
  return username.replace(/\./g, '');
}

/**
 * Create the domain for a user, using their username
 * @param username The user's username (e.g., `jsmith` or `john.smith`)
 * @returns string j.smith -> jsmith.starchart.com
 */
export function buildUserBaseDomain(username: PrismaUser['username']) {
  return `${cleanUsername(username)}.${process.env.ROOT_DOMAIN}`;
}

export function buildDomain(username: PrismaUser['username'], name?: string) {
  if (name) {
    return `${name}.${buildUserBaseDomain(username)}`;
  }
  return buildUserBaseDomain(username);
}

export function getSubdomainFromFqdn(username: PrismaUser['username'], fqdn: string): string {
  const baseDomain = buildUserBaseDomain(username);

  if (!fqdn.endsWith(`.${baseDomain}`)) {
    throw new Error("fqdn is not a subdomain of user's base domain");
  }

  // Cut the base domain from
  const subdomain = fqdn.substring(0, fqdn.length - (baseDomain.length + 1));

  return subdomain;
}

export function useOptionalUser(): User | undefined {
  const data = useMatchesData('root');
  if (!data || !isUser(data.user)) {
    return undefined;
  }
  return data.user;
}

export function useUser(): User {
  const maybeUser = useOptionalUser();
  if (!maybeUser) {
    throw new Error(
      'No user found in root loader, but user is required by useUser. If user is optional, try useOptionalUser instead.'
    );
  }
  return maybeUser;
}

/**
 * This async Fn takes a BullMQ job, and the queue name
 * and returns children jobs that are of that queue name
 * @param {string} jobName
 * @param {Job} job
 *
 * @returns {Promise<Object>}
 */

export async function getChildrenValuesOfQueueName<CT>({
  queueName,
  job,
}: {
  queueName: string;
  job: Job;
}): Promise<{
  [jobKey: string]: CT;
}> {
  const childrenValues = await job.getChildrenValues();
  const filteredChildrenValues = Object.keys(childrenValues)
    .filter((jobKey) => jobKey.includes(queueName))
    .reduce((acc, jobKey) => ({ ...acc, [jobKey]: childrenValues[jobKey] }), {});

  return filteredChildrenValues;
}
