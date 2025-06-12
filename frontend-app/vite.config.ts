import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'

export default defineConfig({
  plugins: [
    TanStackRouterVite({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@tabler/icons-react': '@tabler/icons-react/dist/esm/icons/index.mjs',
    },
  },
  server: {
    allowedHosts: ['offermanagerappv2.southindia.cloudapp.azure.com'],
    port: 3000,       // 👈 use port 3000
    host: '0.0.0.0',  // 👈 required for Docker
    watch: {
      usePolling: true, // 👈 Required for file watching in Docker
    },
  },
})
