import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import mdx from '@mdx-js/rollup'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import remarkGfm from 'remark-gfm'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),

    mdx({
      jsxImportSource: 'vue',

      remarkPlugins: [
        remarkMath,
        remarkGfm,
      ],

      rehypePlugins: [
        rehypeKatex,
      ],
    }),
  ],

  // GitHub Pages:
  // https://xxx.github.io/SketchClaw/
  base: '/SketchClaw/',

  resolve: {
    alias: {
      '@': fileURLToPath(
        new URL('./src', import.meta.url)
      ),
    },
  },

  // ============================================================
  // Multi-page build
  // ============================================================
  build: {
    rollupOptions: {
      input: {
        // 原来的主页
        main: fileURLToPath(
          new URL('./index.html', import.meta.url)
        ),

        // More Results 页面
        moreResults: fileURLToPath(
          new URL('./more-results.html', import.meta.url)
        ),
      },
    },
  },
})