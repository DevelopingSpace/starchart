import logger from '~/lib/logger.server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
  const username = 'starchartdev';
  const displayName = 'Starchart Developer';
  const email = 'dev@starchart.invalid';
  const group = 'mycustomdomain-admins';
  let dnsRecordExpDate = new Date();
  dnsRecordExpDate.setMonth(dnsRecordExpDate.getMonth() + 6); // a dns record expires after 6 months
  let certExpDate = new Date();
  certExpDate.setDate(certExpDate.getDate() + 90); // certificate expires after 90 days
  let temporaryExpDate = new Date();
  temporaryExpDate.setDate(temporaryExpDate.getDate() + 7); // expiration for notifications

  // cleanup the existing database; no worries if it doesn't exist yet
  await prisma.dnsRecord.deleteMany().catch(() => {});
  await prisma.challenge.deleteMany().catch(() => {});
  await prisma.certificate.deleteMany().catch(() => {});
  await prisma.user.deleteMany().catch(() => {});

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
      {
        username: 'user4',
        displayName: 'Deactivated User',
        email: 'user4@myseneca.ca',
        group: 'mycustomdomain-students',
        deactivated: true,
      },
    ],
  });

  await prisma.certificate.create({
    data: {
      id: 1,
      username,
      domain: `*.${username}.example.com`,
      certificate:
        '-----BEGIN CERTIFICATE-----ApfFCv0O65TYkp5jEWSlU8PhKYD43nXA=-----END CERTIFICATE-----',
      orderUrl: `orderUrl.example.com`,
      privateKey:
        '-----BEGIN CERTIFICATE-----ApfFCv0O65TYkp5jEWSlU8PhKYD43nXA=-----END CERTIFICATE-----',
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
