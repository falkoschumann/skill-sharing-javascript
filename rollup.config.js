import nodeResolve from '@rollup/plugin-node-resolve';

export default {
  input: ['./node_modules/lit-html/lit-html.js'],
  output: {
    dir: 'public/vendor',
    format: 'esm',
  },
  plugins: [nodeResolve()],
};
