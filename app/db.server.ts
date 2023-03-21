import { PrismaClient } from '@prisma/client';

import logger from '~/lib/logger.server';
import secrets from './lib/secrets.server';

let prisma: PrismaClient;

declare global {
  var __db__: PrismaClient;
}

// this is needed because in development we don't want to restart
// the server with every change, but we want to make sure we don't
// create a new connection to the DB with every change either.
// in production we'll have a single connection to the DB.
if (process.env.NODE_ENV === 'production') {
  prisma = getClient();
} else {
  if (!global.__db__) {
    global.__db__ = getClient();
  }
  prisma = global.__db__;
}

function getClient() {
  const DATABASE_URL =
    process.env.NODE_ENV === 'production'
      ? secrets.DATABASE_URL
      : // Allow using env or secrets in dev/testing only
        process.env.DATABASE_URL || secrets.DATABASE_URL;

  if (typeof DATABASE_URL !== 'string') {
    throw new Error('DATABASE_URL secret not set');
  }

  const databaseUrl = new URL(DATABASE_URL);

  logger.info(`🔌 setting up prisma client to ${databaseUrl.host}`);
  // NOTE: during development if you change anything in this function, remember
  // that this only runs once per server restart and won't automatically be
  // re-run per request like everything else is. So if you need to change
  // something in this file, you'll need to manually restart the server.
  const client = new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl.toString(),
      },
    },
  });
  // connect eagerly
  client.$connect();

  return client;
}

export { prisma };
