import { defineConfig } from 'vite-plus'
import vue from '@vitejs/plugin-vue'
import monkey, { cdn } from 'vite-plugin-monkey'
import UnoCSS from 'unocss/vite'
import unocssInline from 'unocss-inline'
import NuxtUI from '@nuxt/ui/vite'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  devtools: {
    apply: 'serve',
    allowedOrigins: ['https://jp.finalfantasyxiv.com'],
  },
  test: {
    // Vitest v4 compatibility: preserve mock call history.
    // Remove after tests no longer rely on calls from setup or earlier tests.
    // https://viteplus.dev/guide/vitest-v5#remove-unneeded-compatibility-settings
    // https://vitest.dev/guide/migration/#clearmocks-is-enabled-by-default
    clearMocks: false,
  },
  plugins: [
    vue(),
    NuxtUI({
      ui: {
        colors: {
          primary: 'red',
        },
      },
    }),
    UnoCSS(),
    unocssInline(),
    monkey({
      entry: 'src/main.ts',
      userscript: {
        icon: 'https://vitejs.dev/logo.svg',
        namespace: 'https://unun.dev',
        match:
          command === 'serve' // vite dev
            ? ['https://*.finalfantasyxiv.com/*']
            : ['https://*/*'],
        name: '沃卡露比',
        author: 'UnluckyNinja',
        description: '以注音标记方式在文本上显示词语翻译，适用于游戏名词、专业术语等',
        $extra: [
          ['name:en', 'Vocabulary Ruby'],
          [
            'description:en',
            'Auto-annotate dictionary words with ruby tags, for gaming words, or professional terms',
          ],
        ],
        connect: [
          'docs.google.com',
          'googleusercontent.com',
          'github.com',
          'raw.githubusercontent.com',
          '*',
        ],
      },
      build: {
        fileName: 'vocabulary-ruby.user.js',
        externalGlobals: {
          vue: cdn.jsdelivr('Vue', 'dist/vue.global.prod.js'),
        },
      },
    }),
  ],
}))
