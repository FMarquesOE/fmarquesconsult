import { defineConfig } from 'vite';
import { resolve } from 'node:path';

/* Duas páginas: o site e a página de privacidade */
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        privacidade: resolve(import.meta.dirname, 'privacidade.html'),
      },
    },
  },
});
