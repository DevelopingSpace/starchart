import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx --require tsconfig-paths/register prisma/seed.ts',
  },
  datasource: {
    url:
      process.env.DATABASE_URL || 'mysql://starchart:starchart_password@127.0.0.1:3306/starchart',
  },
});
