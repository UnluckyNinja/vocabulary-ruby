import { defineConfig } from 'vite-plus'
import vue from '@vitejs/plugin-vue'
import monkey, { cdn } from 'vite-plugin-monkey'
import Inspect from 'vite-plugin-inspect'
import UnoCSS from 'unocss/vite'
import unocssInline from 'unocss-inline'
import NuxtUI from '@nuxt/ui/vite'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  devtools: {
    apply: 'serve',
  },
  test: {
    // Vitest v4 compatibility: preserve mock call history.
    // Remove after tests no longer rely on calls from setup or earlier tests.
    // https://viteplus.dev/guide/vitest-v5#remove-unneeded-compatibility-settings
    // https://vitest.dev/guide/migration/#clearmocks-is-enabled-by-default
    clearMocks: false,
  },
  plugins: [
    Inspect(),
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
        namespace: 'vocabulary-ruby',
        match:
          command === 'serve' // vite dev
            ? ['https://*.finalfantasyxiv.com/*']
            : ['https://*/*'],
        name: 'Vocabulary Ruby',
        author: 'UnluckyNinja',
        description: 'Auto-annotate dictionary words with ruby tags',
        connect: ['docs.google.com', 'googleusercontent.com'],
      },
      build: {
        externalGlobals: {
          vue: cdn.jsdelivr('Vue', 'dist/vue.global.prod.js'),
        },
      },
    }),
  ],
}))
