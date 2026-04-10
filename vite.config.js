import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],

  server: {
     port: 5173,
     proxy: {
       '/api': {
         target: 'http://localhost:5000',
         changeOrigin: true,
         secure: false,
         timeout: 30000,
         configure: (proxy) => {
           proxy.on('error', (err, req, res) => {
             console.error('❌ Proxy error:', err);
           });
           proxy.on('proxyReq', (proxyReq, req) => {
             console.log(`📤 Proxying ${req.method} ${req.url} -> ${proxyReq.path}`);
           });
           proxy.on('proxyRes', (proxyRes, req, res) => {
             console.log(`📥 Proxy response: ${proxyRes.statusCode} for ${req.url}`);
           });
         }
       },
       '/uploads': {
         target: 'http://localhost:5000',
         changeOrigin: true,
         secure: false
       }
     },
     optimizeDeps: {
       include: ['lucide-react']
     }
   }
})
 
