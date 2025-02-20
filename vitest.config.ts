import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    globals: true,
    setupFiles: ['./test/unit/setup-test-env.ts'],
    include: ['./test/unit/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    coverage: {
      provider: 'istanbul',
    },
  },
  server: {
    watch: {
      ignored: ['.*\\/node_modules\\/.*', '.*\\/build\\/.*', '.*\\/docker\\/volumes\\/.*'],
    },
  },
});
