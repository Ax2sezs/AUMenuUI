import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react()],
    server: {
    host: '0.0.0.0', // 👈 อนุญาตให้เครื่องอื่นใน network เข้าถึงได้
    port: 5173,      // (ปรับได้ตามต้องการ)
  },
  build: {
    minify: "esbuild",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  }
})
