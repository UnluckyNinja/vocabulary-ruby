import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import monkey, { cdn } from 'vite-plugin-monkey';
import Inspect from 'vite-plugin-inspect'
import UnoCSS from 'unocss/vite';
import unocssInline from 'unocss-inline';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    Inspect(),
    vue(),
    UnoCSS(),
    unocssInline(),
    monkey({
      entry: 'src/main.ts',
      userscript: {
        icon: 'https://vitejs.dev/logo.svg',
        namespace: 'npm/vite-plugin-monkey',
        match: [
          'https://*/*',
        ],
        name: 'Vocabulary Ruby',
        author: 'UnluckyNinja',
        description: 'Auto-annotate dictionary words with ruby tags',
        connect: [
          'docs.google.com',
          'googleusercontent.com',
        ],
        grant: [
          'GM_setValue',
          'GM_getValue',
          'GM_xmlhttpRequest',
          'GM_registerMenuCommand',
          'GM_addStyle', // Required for dynamic styles
        ],
      },
      build: {
        externalGlobals: {
          vue: cdn.jsdelivr('Vue', 'dist/vue.global.prod.js'),
        },
      },
    }),
  ],
});
