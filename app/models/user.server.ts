import { prisma } from '~/db.server';
import logger from '~/lib/logger.server';

import type { User as PrismaUser } from '@prisma/client';

export interface User extends PrismaUser {
  // the base domain to use for all DNS records created by this user
  // (e.g., jsmith.starchart.com with records using *.jsmith.starchart.com)
  baseDomain: string;
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
 * @returns string jsmith -> jsmith.starchart.com
 */
function buildUserBaseDomain(username: PrismaUser['username']) {
  return `${cleanUsername(username)}.${process.env.ROOT_DOMAIN}`;
}

export async function getUserByUsername(username: PrismaUser['username']) {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    return null;
  }

  // Decorate with the user's base domain as well
  return { ...user, baseDomain: buildUserBaseDomain(username) };
}

/**
 * Check whether or not a user exists already with the given username
 * @param username
 * @returns boolean
 */
export async function checkUsernameExists(username: PrismaUser['username']) {
  const user = await prisma.user.findUnique({ where: { username } });
  return user !== null;
}

export async function createUser(
  username: PrismaUser['username'],
  firstName: PrismaUser['firstName'],
  lastName: PrismaUser['lastName'],
  email: PrismaUser['email']
) {
  logger.info(`Creating new user ${username}`);
  return prisma.user.create({
    data: {
      username,
      firstName,
      lastName,
      email,
    },
  });
}
