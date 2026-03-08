import { createApp } from 'vue';
import App from './App.vue';

// styles for ruby elements
import bodyStyle from './body.css?inline'

// styles for widget
import styleCss from './style.css?inline'
import unoCss from 'unocss-inline/style'
import { GM_addStyle } from '$';

// wrap widget in shadow DOM to avoid polluting page
const shadow = document.body
  .appendChild(document.createElement('div'))
  .attachShadow({ mode: 'open' });
const element = document.createElement('div')
shadow.appendChild(element)

createApp(App).mount(element)

// add styles to shadow DOM
function addStyle(content: string){
  const cssEle = document.createElement('style')
  cssEle.textContent = content
  shadow.appendChild(cssEle)
  return cssEle
}

GM_addStyle(bodyStyle)

// @property unfortunately will be ignored in shadow DOM,
// so we have to move them to parent.
// there are some other directives in it, I guess it won't hurt though.
const sheet = new CSSStyleSheet()
const mo = new MutationObserver(()=>{
  sheet.replaceSync(unoCss.textContent.split('\n').filter(it=>it.startsWith('@') && it.endsWith('}')).join('\n'))
})
mo.observe(unoCss, {
  childList: true,
})

shadow.appendChild(unoCss)
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