import js from '@eslint/js';
import { configs } from 'eslint-plugin-lit';
import globals from 'globals';

/** @type { import("eslint").Linter.Config[] } */
export default [
  js.configs.recommended,
  configs['flat/recommended'],
  {
    languageOptions: {
      ecmaVersion: 2022,
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
