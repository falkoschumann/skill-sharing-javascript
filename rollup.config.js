import nodeResolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';

export default {
  input: ['./src/client/app.ts'],
  output: {
    file: 'public/js/skillsharing.js',
    format: 'esm',
    compact: true,
  },
  plugins: [nodeResolve(), terser(), typescript()],
};
