import { vitePlugin as remix } from '@remix-run/dev';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { cjsInterop } from 'vite-plugin-cjs-interop';
import esbuild from 'esbuild';

export default defineConfig({
  plugins: [
    !process.env.VITEST &&
      remix({
        ignoredRouteFiles: ['**/.*', '**/*.css', '**/*.test.{js,jsx,ts,tsx}'],
        serverBuildFile: 'remix.js',
        buildEnd: async () => {
          await esbuild
            .build({
              alias: { '~': './app' },
              outfile: './build/server/index.js',
              entryPoints: ['./server.ts'],
              external: ['./build/server/*'],
              platform: 'node',
              format: 'esm',
              packages: 'external',
              bundle: true,
              logLevel: 'info',
            })
            .catch((error: unknown) => {
              console.error('Error building server:', error);
              process.exit(1);
            });
        },
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
