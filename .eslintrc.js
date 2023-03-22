/** @type {import('@types/eslint').Linter.BaseConfig} */
module.exports = {
  extends: [
    '@remix-run/eslint-config',
    '@remix-run/eslint-config/node',
    'plugin:playwright/playwright-test',
    'prettier',
  ],
  // We're using vitest which has a very similar API to jest
  // (so the linting plugins work nicely), but we have to
  // set the jest version explicitly.
  rules: {
    'no-console': ['warn'],
    'no-else-return': ['error'],
    'curly': ['error'],
  },
  settings: {
    jest: {
      version: 28,
    },
  },
};
