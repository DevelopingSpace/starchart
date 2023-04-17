import logger from '~/lib/logger.server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
  const username = 'starchartdev';
  const displayName = 'Starchart Developer';
  const email = 'dev@starchart.invalid';
  const group = 'mycustomdomain-admins';
  let temporaryExpDate = new Date();
  temporaryExpDate.setDate(temporaryExpDate.getDate() + 7); // expiration for notifications

  // cleanup the existing database; no worries if it doesn't exist yet
  await prisma.systemState.deleteMany().catch(() => {});
  await prisma.user.deleteMany().catch(() => {});

  await prisma.systemState.create({
    data: {
      unique: 'unique',
      reconciliationNeeded: false,
    },
  });

  await prisma.user.createMany({
    data: [
      {
        username,
        displayName,
        email,
        group,
      },
      {
        username: 'user1',
        displayName: 'Johannes Kepler',
        email: 'user1@myseneca.ca',
        group: 'mycustomdomain-faculty',
      },
      {
        username: 'user2',
        displayName: 'Galileo Galilei',
        email: 'user2@myseneca.ca',
        group: 'mycustomdomain-students',
      },
      {
        username: 'user3',
        displayName: 'Adam Mason',
        email: 'user3@myseneca.ca',
        group: 'mycustomdomain-admins',
      },
    ],
  });

  await prisma.certificate.create({
    data: {
      id: 1,
      username,
      domain: `*.${username}.example.com`,
      orderUrl: `orderUrl.example.com`,
      privateKey:
        '-----BEGIN CERTIFICATE-----ApfFCv0O65TYkp5jEWSlU8PhKYD43nXA=-----END CERTIFICATE-----',
      certificate:
        '-----BEGIN CERTIFICATE-----BpfFCv0OuF8AujEWv0Okp5jEWSlAuD43=-----END CERTIFICATE-----',
      chain:
        '-----BEGIN CERTIFICATE-----CjEWSlU8PhKYTYWSlU8hKYTYkp5jewDW=-----END CERTIFICATE-----',
      validFrom: new Date(),
      validTo: temporaryExpDate,
      status: 'pending',
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
