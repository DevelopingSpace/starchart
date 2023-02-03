import logger from '~/lib/logger.server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
  const username = 'starchartdev';
  const name = 'Starchart Developer';
  const email = 'dev@starchart.invalid';

  // cleanup the existing database
  await prisma.user.delete({ where: { username } }).catch(() => {
    // no worries if it doesn't exist yet
  });

  await prisma.user.create({
    data: {
      username,
      name,
      email,
    },
  });

  logger.info(`Database has been seeded. 🌱`);
}

seed()
  .catch((e) => {
    logger.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
