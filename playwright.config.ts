import type { PlaywrightTestConfig } from '@playwright/test';
import { devices } from '@playwright/test';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const config: PlaywrightTestConfig = {
  testDir: './test/e2e',
  /* Maximum time one test can run for. */
  timeout: 30 * 1000,
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met.
     * For example in `await expect(locator).toHaveText();`
     */
    timeout: 5000,
  },
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /**
   * Retry on CI twice
   * Retry in development once - this generated a video on the first retry of a failed test,
   * allowing easier debugging without pushing to a branch or modifying this manually
   */
  retries: process.env.CI ? 2 : 1,
  /**
   * Opt out of parallel tests
   * This is needed as we want to delete records between tests
   * When running in parallel, the tests start running before the deletion is complete
   * The alternative would be to make tests depend on each other, i.e., use different test values
   * for each test
   */
  workers: 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
    actionTimeout: 0,
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:8080',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    /* Record video on first retry */
    video: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    /**
     * Setup project to save authentication state
     * This is to avoid having to login before each test
     */
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
      dependencies: ['setup'],
      testIgnore: /.*\.mobile\.spec\.ts/,
    },

    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
      },
      dependencies: ['setup'],
      testIgnore: /.*\.mobile\.spec\.ts/,
    },

    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
      },
      dependencies: ['setup'],
      testIgnore: /.*\.mobile\.spec\.ts/,
    },

    /* Test against mobile viewports. */
    {
      name: 'Mobile Chrome',
      use: {
        ...devices['Pixel 5'],
      },
      dependencies: ['setup'],
      testIgnore: /.*\.desktop\.spec\.ts/,
    },
    /**
     * We override the isMobile for Mobile Safari to false to make it work in CI
     * Relevant comment on currently open issue in playwright:
     * https://www.github.com/microsoft/playwright/issues/11812#issuecomment-1462829766
     */
    {
      name: 'Mobile Safari',
      use: {
        userAgent: devices['iPhone 12'].userAgent,
        viewport: devices['iPhone 12'].viewport,
        deviceScaleFactor: devices['iPhone 12'].deviceScaleFactor,
        isMobile: false,
        hasTouch: devices['iPhone 12'].hasTouch,
        defaultBrowserType: devices['iPhone 12'].defaultBrowserType,
      },
      dependencies: ['setup'],
      testIgnore: /.*\.desktop\.spec\.ts/,
    },

    /* Test against branded browsers. */
    {
      name: 'Microsoft Edge',
      use: {
        channel: 'msedge',
      },
      dependencies: ['setup'],
      testIgnore: /.*\.mobile\.spec\.ts/,
    },
    {
      name: 'Google Chrome',
      use: {
        channel: 'chrome',
      },
      dependencies: ['setup'],
      testIgnore: /.*\.mobile\.spec\.ts/,
    },
  ],

  /* Folder for test artifacts such as screenshots, videos, traces, etc. */
  outputDir: 'test-results/',
};

export default config;
