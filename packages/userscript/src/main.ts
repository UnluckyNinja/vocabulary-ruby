import { createApp } from 'vue';
import App from './App.vue';

// styles for ruby elements
import bodyStyle from './body.css?inline'

// styles for widget
import styleCss from './style.css?inline'
import unoCss from 'unocss-inline/style'
import { GM_addStyle } from '$';

// wrap widget in shadow DOM to avoid polluting page
import { shadowRoot, portalTarget } from './shadowRoot'

createApp(App).mount(portalTarget)

// add styles to shadow DOM
function addStyle(content: string){
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
const mo = new MutationObserver((list, obs)=>{
  // console.log(list)
  const text = unoCss.textContent.split('\n').filter(it=>it.startsWith('@') && it.endsWith('}')).join('\n')
  // console.log(text)
  sheet.replaceSync(text)
})

// on Firefox subtree + characterData will work, while only childList will not work.
mo.observe(unoCss, {
  // childList: true,
  subtree: true,
  characterData: true,
})

shadowRoot.appendChild(unoCss)
document.adoptedStyleSheets.push(sheet)
const styleEle = addStyle(styleCss)

// HMR for styles
if (import.meta.hot) {
  import.meta.hot.accept([
    './style.css?inline'
  ],([styleCss])=>{
    if (styleCss) {
      styleEle.textContent = styleCss.default
    }
  })
}