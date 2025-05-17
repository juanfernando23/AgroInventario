import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react', 'pg', 'pg-pool', 'pg-promise'],
    esbuildOptions: {
      // Excluir módulos específicos de Node.js que no deberían procesarse
      external: ['pg', 'pg-pool', 'pg-promise', 'fs', 'path', 'os']
    }
  },
  // Excluir pg y relacionados del procesamiento del lado del cliente
  build: {
    rollupOptions: {
      external: ['pg', 'pg-pool', 'pg-promise', 'fs', 'path', 'os']
    },
  },
  // Resolver el problema de cloudflare:sockets y módulos de Node
  resolve: {
    alias: {
      'cloudflare:sockets': path.resolve(__dirname, './src/db/cloudflare-socket-shim.js'),
      'pg': path.resolve(__dirname, './src/db/node-shims.js'),
      'pg-pool': path.resolve(__dirname, './src/db/node-shims.js'),
      'pg-promise': path.resolve(__dirname, './src/db/node-shims.js')
    },
  },
  // Evitar que Vite intente buscar módulos específicos de Node.js
  // que no son compatibles con el navegador
  server: {
    hmr: {
      overlay: true
    },
    proxy: {
      // Redireccionar las llamadas a la API al servidor backend
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  },
});
