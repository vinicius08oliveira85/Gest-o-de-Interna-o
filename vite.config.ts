import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const repoName = 'Gest-o-de-Interna-o';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? `/${repoName}/` : '/',
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    hmr: {
      clientPort: 443
    }
  }
}));
