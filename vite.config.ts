import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const repoName = 'Gest-o-de-Interna-o';
const shouldUseGhPagesBase =
  process.env.DEPLOY_TARGET === 'gh-pages' ||
  (process.env.NODE_ENV === 'production' && process.env.VERCEL !== '1' && process.env.CI === 'true');

// https://vitejs.dev/config/
export default defineConfig(() => ({
  base: shouldUseGhPagesBase ? `/${repoName}/` : '/',
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    hmr: {
      clientPort: 443
    }
  }
}));
