import { createApp } from 'vue';
import App from './App.vue';

// styles for ruby elements
import bodyStyle from './body.css?inline'

// styles for widget
import styleCss from './style.css?inline'
import { createUnoStyle, unoCss } from 'unocss-inline/css'
import { GM_addStyle } from '$';

// wrap widget in shadow DOM to avoid polluting page
import { shadowRoot, portalTarget } from './shadowRoot'

const app = createApp(App)
app.mount(portalTarget)

// add styles to shadow DOM
function addStyle(content: string) {
  const cssEle = document.createElement('style')
  cssEle.textContent = content
  shadowRoot.appendChild(cssEle)
  return cssEle
}

GM_addStyle(bodyStyle)

// @property unfortunately will be ignored in shadow DOM,
// so we have to move them to the root document.
// there are some other directives in it, I guess it won't hurt though.
const sheet = new CSSStyleSheet()
unoCss.subscribe(newVal => {
  // console.log(list)
  const text = newVal.split('\n').filter(it => it.startsWith('@') && it.endsWith('}')).join('\n')
  // console.log(text)
  sheet.replaceSync(text)
})

shadowRoot.appendChild(createUnoStyle())
document.adoptedStyleSheets.push(sheet)
const styleEle = addStyle(styleCss)

// HMR for styles
if (import.meta.hot) {
  import.meta.hot.accept([
    './style.css?inline'
  ], ([styleCss]) => {
    if (styleCss) {
      styleEle.textContent = styleCss.default
    }
  })
}