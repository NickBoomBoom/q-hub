import { resolve } from 'path';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      // external: ['quarkc'], // 可选项，是否将 quarkc 打包进组件
      output: {
        dir: 'dist',
        globals: {
          quarkc: 'Quarkc',
        },
      },
    },
  },
});
