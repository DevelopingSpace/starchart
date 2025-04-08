import { vitePlugin as remix } from '@remix-run/dev';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { cjsInterop } from 'vite-plugin-cjs-interop';
import { expressDevServer } from 'remix-express-dev-server';

export default defineConfig({
  build: {
    target: 'esnext',
  },
  server: {
    port: process.env.PORT ? parseInt(process.env.PORT) : 8080,
  },
  plugins: [
    !process.env.VITEST && expressDevServer(),
    remix({
      ignoredRouteFiles: ['**/.*', '**/*.css', '**/*.test.{js,jsx,ts,tsx}'],
    }),
    tsconfigPaths(),
    // https://remix.run/docs/en/main/guides/vite#esm--cjs
    cjsInterop({
      dependencies: ['@emotion/cache'],
    }),
  ],
  optimizeDeps: {
    include: [
      '@emotion/cache',
      '@emotion/react',
      '@chakra-ui/react',
      '@remix-run/node',
      'docker-secret',
      'winston',
      '@prisma/client',
      '@chakra-ui/icons',
      'remix-typedjson',
      'dayjs',
      'bullmq',
      'ioredis',
      'acme-client',
      'nodemailer',
      'react-use',
      'react-icons/fa',
      'react-icons/tb',
      'react-icons/gr',
      'zod',
      'zodix',
      'bad-words',
      'validator',
    ],
  },
  ssr: {
    noExternal: ['react-use'],
  },
});
