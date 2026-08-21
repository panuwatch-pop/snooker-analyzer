import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // เปิดให้ทุกอุปกรณ์ในวง Wi-Fi เดียวกันเข้าถึงได้ผ่าน IP (Network Host)
    port: 5173,
  }
})
