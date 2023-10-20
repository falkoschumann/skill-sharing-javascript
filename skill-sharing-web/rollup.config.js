import nodeResolve from '@rollup/plugin-node-resolve';

export default {
  input: ['./src/main.js'],
  output: {
    file: '../skill-sharing-server/public/js/app.js',
    format: 'esm',
  },
  plugins: [nodeResolve()],
};
