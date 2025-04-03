import { vitePlugin as remix } from '@remix-run/dev';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { cjsInterop } from 'vite-plugin-cjs-interop';

export default defineConfig({
  plugins: [
    !process.env.VITEST &&
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
    include: ['@emotion/cache'],
  },
});
