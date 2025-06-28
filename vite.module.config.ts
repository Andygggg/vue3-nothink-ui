// vite.lib.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue(),
    dts({
      // 使用專用的 tsconfig
      tsconfigPath: './tsconfig.lib.json',
      cleanVueFileName: true,
      insertTypesEntry: true,
      copyDtsFiles: true,

      // 只掃描 lib 目錄
      include: ['lib/**/*'],
      exclude: ['src/**/*', 'node_modules', 'demo'],

      // 生成到 lib_dist 目錄
      outDir: 'lib_dist',

      // 生成單個 index.d.ts 文件
      rollupTypes: true,

      // 確保 Vue 單文件組件的類型正確
      compilerOptions: {
        preserveValueImports: true,
      },
    }),
  ],

   resolve: {
    alias: {
      '@lib': resolve(__dirname, 'lib'),
      '@': resolve(__dirname, 'lib'),
    },
  },

  build: {
    outDir: 'lib_dist',

    lib: {
      entry: './lib/index.ts',
      fileName: (format) => `index.${format}.js`,
      formats: ['es', 'cjs'], // 只保留 ES 和 CommonJS
    },

    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue',
        },
      },
    },

    emptyOutDir: true,
    copyPublicDir: false,
    sourcemap: true,
    cssCodeSplit: false,
    minify: 'esbuild',
  },
})
