/** @type {import('vite').UserConfig} */
export default {
  server: {
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
      },
    },
  },
};
