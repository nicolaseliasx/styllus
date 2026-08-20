import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: process.env.VITE_BASE_PATH || process.env.BASE_PATH || './',
  plugins: [
    {
      name: 'dev-redirect',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/links') {
            req.url = '/links/';
          }
          next();
        });
      }
    }
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        links: resolve(__dirname, 'links/index.html')
      }
    }
  }
});
