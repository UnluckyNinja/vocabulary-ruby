import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import monkey, { cdn } from 'vite-plugin-monkey';
import UnoCSS from 'unocss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    UnoCSS(),
    monkey({
      entry: 'src/main.ts',
      userscript: {
        icon: 'https://vitejs.dev/logo.svg',
        namespace: 'npm/vite-plugin-monkey',
        match: ['*://*/*'],
        name: 'Vocabulary Ruby',
        author: 'User',
        description: 'Auto-annotate dictionary words with ruby tags',
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
