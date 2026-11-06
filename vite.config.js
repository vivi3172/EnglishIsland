import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  // 相對路徑，方便部署到任何子目錄（GitHub Pages / IIS 子路徑）
  base: './',
  plugins: [vue()],
  test: {
    include: ['tests/**/*.test.js'],
  },
})
