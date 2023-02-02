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

  console.log(`Database has been seeded. 🌱`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
