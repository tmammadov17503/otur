import tailwindcss from '@tailwindcss/postcss';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';

const projectRoot = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  root: fileURLToPath(new URL('./pages-src', import.meta.url)),
  base: process.env.OTUR_BASE_PATH || '/otur/',
  publicDir: fileURLToPath(new URL('./public', import.meta.url)),
  css: { postcss: { plugins: [tailwindcss()] } },
  plugins: [react()],
  resolve: {
    alias: {
      '@': projectRoot,
      'next/image': fileURLToPath(new URL('./pages-src/next-image.tsx', import.meta.url)),
    },
  },
  build: {
    outDir: fileURLToPath(new URL('./pages-dist', import.meta.url)),
    emptyOutDir: true,
  },
});
