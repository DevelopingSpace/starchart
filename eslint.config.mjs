import path from 'node:path';
import js from '@eslint/js';
import { includeIgnoreFile } from '@eslint/compat';

import typescriptEslint from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';

import importPlugin from 'eslint-plugin-import';
import reactPlugin from 'eslint-plugin-react';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import oxlint from 'eslint-plugin-oxlint';

import globals from 'globals';

const gitignorePath = path.resolve(import.meta.dirname, '.gitignore');

/** @type {import('eslint').Linter.Config[]} */
export default [
  js.configs.recommended,
  importPlugin.flatConfigs.recommended,
  includeIgnoreFile(gitignorePath),
  {
    ignores: [
      '.github/**',
      '.husky/**',
      'config/**',
      'dev-secrets/**',
      'docs/**',
      'test/e2e/**',
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
        tsconfigRootDir: import.meta.dirname,
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
  // Node environment for eslint.config.mjs
  {
    files: ['eslint.config.mjs'],
    languageOptions: {
      ecmaVersion: 'latest',
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'off',
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
        },
      },
    },
  },
  ...oxlint.buildFromOxlintConfigFile('./.oxlintrc.json'),
];
