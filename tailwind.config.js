/** @type {import('tailwindcss').Config} */
export default {
  content: ['./public/index.html', './src/**/*.js'],
  theme: {
    extend: {},
  },
  plugins: [import('@tailwindcss/forms')],
};
