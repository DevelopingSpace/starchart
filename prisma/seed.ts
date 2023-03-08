import logger from '~/lib/logger.server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
  const username = 'starchartdev';
  const displayName = 'Starchart Developer';
  const email = 'dev@starchart.invalid';
  const group = 'mycustomdomain-admins';
  let recordExpDate = new Date();
  recordExpDate.setMonth(recordExpDate.getMonth() + 6); // a record expires after 6 months
  let certExpDate = new Date();
  certExpDate.setDate(certExpDate.getDate() + 90); // certificate expires after 90 days

  // cleanup the existing database; no worries if it doesn't exist yet
  await prisma.record.deleteMany().catch(() => {});
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
    ],
  });

  await prisma.record.createMany({
    data: [
      // A record
      {
        id: 1,
        username,
        name: 'osd700',
        type: `A`,
        value: '172.5.251.0',
        description: 'For final project.',
        course: 'OSD700',
        ports: '8080, 1234',
        expiresAt: recordExpDate,
        status: `active`,
      },
      // AAAA record
      {
        id: 2,
        username,
        name: 'web244',
        type: `AAAA`,
        value: '2002:db8:1111:4444:5555:6666:7777:8888',
        description: 'Assignment 1',
        course: 'WEB244',
        ports: '8080',
        expiresAt: recordExpDate,
        status: `active`,
      },
      // CNAME record
      {
        id: 3,
        username,
        name: 'web466as2',
        type: `CNAME`,
        value: 'some.external.domain',
        description: 'Assignment 2',
        course: 'WEB466',
        ports: '8000',
        expiresAt: recordExpDate,
        status: `active`,
      },
      // TXT record
      {
        id: 4,
        username,
        name: 'ccp522',
        type: `TXT`,
        value: 'google-site-verification=6P08Ow5E-8Q0m6vQ7FMAqAYIDprkVV8fUf_7hZ4Qvc8',
        expiresAt: recordExpDate,
        status: `active`,
      },
      // a record with error status
      {
        id: 5,
        username,
        name: 'expired',
        type: `AAAA`,
        value: '2002:db8:1111:4444:5555:6666:7777:8888',
        expiresAt: recordExpDate,
        status: `error`,
      },
      // a pending record
      {
        id: 6,
        username,
        name: 'pending',
        type: `AAAA`,
        value: '2002:db8:1111:4444:5555:6666:7777:8888',
        expiresAt: recordExpDate,
        status: `pending`,
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
      validTo: certExpDate,
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
