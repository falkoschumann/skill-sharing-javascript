import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
import globals from 'globals';

const compat = new FlatCompat();

/** @type { import("eslint").Linter.FlatConfig[] } */
export default [
  js.configs.recommended,
  ...compat.config({
    extends: ['plugin:cypress/recommended'],
  }),
  {
    languageOptions: {
      ecmaVersion: 2023,
      globals: {
        ...globals.es2017,
        ...globals.node,
        ...globals.browser,
        //...globals.serviceworker,
        //...globals['shared-node-browser'],
      },
    },
    ignores: ['**/coverage/**', '**/data/**', '**/vendor/**'],
  },
];
