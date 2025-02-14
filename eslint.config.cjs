const js = require('@eslint/js');
const typescriptEslint = require('@typescript-eslint/eslint-plugin');
const typescriptParser = require('@typescript-eslint/parser');
const globals = require('globals');
const importPlugin = require('eslint-plugin-import');

const reactPlugin = require('eslint-plugin-react');
const jsxA11yPlugin = require('eslint-plugin-jsx-a11y');
const reactHooksPlugin = require('eslint-plugin-react-hooks');
const oxlint = require('eslint-plugin-oxlint');

/** @type {import('eslint').Linter.Config[]} */
module.exports = [
  js.configs.recommended,
  importPlugin.flatConfigs.recommended,
  {
    ignores: [
      '.github/**',
      '.husky/**',
      'build/**',
      'config/**',
      'dev-secrets/**',
      'docker/volumes/**',
      'docs/**',
      'node_modules/**',
      'playwright-report/**',
      'public/build/**',
      'test/e2e/**',
      'test-results/**',
      'playwright.config.ts',
    ],
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.commonjs,
        ...globals.es6,
        ...globals.jest,
        process: 'readonly',
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'off',
    },
    plugins: {
      'react': reactPlugin,
      'jsx-a11y': jsxA11yPlugin,
      'react-hooks': reactHooksPlugin,
    },
    rules: {
      ...reactHooksPlugin.configs.recommended.rules,
      ...reactPlugin.configs.recommended.rules,
      ...jsxA11yPlugin.configs.recommended.rules,
      'react/no-unescaped-entities': 'off',
      'react/display-name': 'off',
      'react/prop-types': 'off',
      'no-prototype-builtins': 'off',
    },
    settings: {
      'react': {
        version: 'detect',
      },
      'jest': {
        version: 27,
      },
      'formComponents': ['Form'],
      'linkComponents': [
        { name: 'Link', linkAttribute: 'to' },
        { name: 'NavLink', linkAttribute: 'to' },
      ],
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
        },
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
      'import/ignore': ['.(css)$'],
    },
  },
  // TypeScript configuration
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: ['./tsconfig.json'],
      },
      globals: {
        ...globals.node,
        React: 'readonly',
        NodeJS: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
    },
    rules: {
      ...typescriptEslint.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      'no-undef': 'off',
    },
  },
  // Node environment for eslint.config.cjs
  {
    files: ['eslint.config.cjs'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  ...oxlint.buildFromOxlintConfigFile('./.oxlintrc.json'),
];
