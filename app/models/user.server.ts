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
  displayName: PrismaUser['displayName'],
  email: PrismaUser['email'],
  group: PrismaUser['group']
) {
  logger.info(`Creating new user ${username}`);
  return prisma.user.create({
    data: {
      username,
      displayName,
      email,
      group,
    },
  });
}

export async function isStudent(username: PrismaUser['username']) {
  const { group } = await prisma.user.findUniqueOrThrow({ where: { username } });
  // The group will have -dev in it on staging but not on prod
  return /mycustomdomain(-dev)?-students/.test(group);
}

export async function isFaculty(username: PrismaUser['username']) {
  const { group } = await prisma.user.findUniqueOrThrow({ where: { username } });
  // The group will have -dev in it on staging but not on prod
  return /mycustomdomain(-dev)?-faculty/.test(group);
}

export async function isAdmin(username: PrismaUser['username']) {
  const { group } = await prisma.user.findUniqueOrThrow({ where: { username } });
  // The group will have -dev in it on staging but not on prod
  return /mycustomdomain(-dev)?-admins/.test(group);
}
