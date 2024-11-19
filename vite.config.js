import process from 'node:process';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'es2022',
  },
  server: {
    port: process.env.DEV_PORT ?? 8080,
    proxy: {
      '/api': {
        target: `http://localhost:${process.env.PORT ?? 3000}`,
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
