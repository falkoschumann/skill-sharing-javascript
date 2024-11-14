import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  test: {
    coverage: {
      provider: 'v8',
      include: ['api/**/*', 'src/**/*', 'test/**/*'],
    },
  },
});
