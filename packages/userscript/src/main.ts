import { createApp } from 'vue'
import NuxtUI from '@nuxt/ui/vue-plugin'
import { createRouter, createMemoryHistory } from 'vue-router'
import App from './App.vue'

// styles for ruby elements
import bodyStyle from './body.css?inline'

// styles for widget
import styleCss from './style.css?inline'
import { createUnoStyle, unoCss } from 'unocss-inline/css'
import { GM_addStyle, monkeyWindow, unsafeWindow } from '$'

// wrap widget in shadow DOM to avoid polluting page
import { shadowRoot, portalTarget } from './shadowRoot'

if (import.meta.env.DEV) {
  console.log('monkeyWindow:')
  console.log(monkeyWindow)
  console.log('unsafeWindow:')
  console.log(unsafeWindow)
  // whatever it is serve or build mode, unsafeWindow is always host window
  if (unsafeWindow === window) {
    console.log('scope->host, host esm scope')
  } else {
    console.log('scope->monkey, userscript scope')
  }
}

const app = createApp(App)

const router = createRouter({
  routes: [],
  history: createMemoryHistory(),
})
app.use(router)

app.use(NuxtUI)
app.mount(portalTarget)

// add styles to shadow DOM
function addStyle(content: string) {
  const cssEle = document.createElement('style')
  cssEle.textContent = content
  shadowRoot.appendChild(cssEle)
  return cssEle
}

// @property unfortunately will be ignored in shadow DOM,
// so we have to move them to the root document.
// there are some other directives in it, I guess it won't hurt though.
const sheet = new CSSStyleSheet()
unoCss.subscribe(newVal => {
  const text = newVal
    .split('\n')
    .filter(it => it.startsWith('@') && it.endsWith('}'))
    .join('\n')
  // console.log(text)
  sheet.replaceSync(text)
})
const unostyle = createUnoStyle()
shadowRoot.appendChild(unostyle)
document.adoptedStyleSheets.push(sheet)

const propertyrules = styleCss.matchAll(/@property[\w\W]*?\}/g)
const styleEle = addStyle(styleCss)
GM_addStyle([bodyStyle, ...propertyrules].join('\n'))

// HMR for styles
if (import.meta.hot) {
  import.meta.hot.accept(['./style.css?inline'], ([styleCss]) => {
    if (styleCss) {
      styleEle.textContent = styleCss.default
    }
  })
}
