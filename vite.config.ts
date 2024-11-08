import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['@web3modal/wagmi'],
  },
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'unsafe-none',
    },
  },
  define: {
    'process.env.VITE_WALLET_CONNECT_PROJECT_ID': JSON.stringify(process.env.VITE_WALLET_CONNECT_PROJECT_ID),
  },
});