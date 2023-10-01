import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';

export default {
  input: ['./src/client/app.js'],
  output: {
    file: 'public/js/skillsharing.js',
    format: 'esm',
    compact: true,
  },
  plugins: [nodeResolve(), terser()],
};
