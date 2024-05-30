import js from '@eslint/js';
import globals from 'globals';

/** @type { import("eslint").Linter.FlatConfig[] } */
export default [
  js.configs.recommended,
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
