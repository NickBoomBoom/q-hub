import { fileURLToPath, URL } from 'node:url'
import { resolve } from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(),
    dts({
      entryRoot:"./src/libs"
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    copyPublicDir:false,
    lib: {
      entry: resolve(__dirname, './src/libs/index.ts'),
      name: 'Vue3History',
      formats:['cjs','es','umd'],
      fileName: 'index',
    },
    rollupOptions: {
      external: ['vue', 'vue-router','@vue/runtime-core'],
      output: {
        globals: {
          vue: 'Vue',
          vueRouter: "VueRouter"
        },
      },
    },
  },
})
