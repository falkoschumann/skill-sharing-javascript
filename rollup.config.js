import nodeResolve from '@rollup/plugin-node-resolve';

export default {
  input: {
    'lit-html': './node_modules/lit-html/lit-html.js',
    '@falkoschumann/shared': 'node_modules/@falkoschumann/shared/src/index.js',
    '@muspellheim/browser-utils':
      'node_modules/@falkoschumann/shared/src/browser/index.js',
  },
  output: {
    dir: 'public/vendor',
    format: 'esm',
  },
  external: ['node:fs/promises'],
  plugins: [nodeResolve()],
};
