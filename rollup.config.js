// run: rollup -c
export default {
  input: ['./node_modules/lit-html/lit-html.js'],
  output: {
    file: 'public/js/vendor.js',
    format: 'esm',
  },
};
