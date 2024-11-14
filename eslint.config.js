import globals from 'globals';
import js from '@eslint/js';
import lit from 'eslint-plugin-lit';
import wc from 'eslint-plugin-wc';

/** @type { import("eslint").Linter.Config[] } */
export default [
  js.configs.recommended,
  lit.configs['flat/recommended'],
  wc.configs['flat/recommended'],
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
    ignores: ['build/**', 'coverage/**', 'data/**', 'vendor/**'],
  },
];
