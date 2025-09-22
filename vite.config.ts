import path from "path"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    // 添加允许的主机
    allowedHosts: [
      'ikc.qzz.io',  // 允许访问的主机
      // 可以添加其他需要允许的主机
    ],
    // 代理配置
    proxy: {
      '/api/baidu': {
        target: 'https://openapi.baidu.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/baidu/, ''),
        secure: true,
      }
    }
  }
})
