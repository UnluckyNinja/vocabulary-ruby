import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import monkey, { cdn } from 'vite-plugin-monkey';
import UnoCSS from 'unocss/vite';
import { presetWind4 } from 'unocss';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    UnoCSS({
      presets: [
        presetWind4()
      ]
    }),
    monkey({
      entry: 'src/main.ts',
      userscript: {
        icon: 'https://vitejs.dev/logo.svg',
        namespace: 'npm/vite-plugin-monkey',
        match: ['https://*/*'],
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
