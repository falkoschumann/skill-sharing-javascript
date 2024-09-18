import nodeResolve from '@rollup/plugin-node-resolve';

export default {
  input: {
    'lit-html': './node_modules/lit-html/lit-html.js',
    '@muspellheim/utils': 'node_modules/@muspellheim/utils/src/index.js',
    '@muspellheim/browser-utils':
      'node_modules/@muspellheim/utils/src/browser/index.js',
  },
  output: {
    dir: 'public/vendor',
    format: 'esm',
  },
  external: ['node:fs/promises'],
  plugins: [nodeResolve()],
};
