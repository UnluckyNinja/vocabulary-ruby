import { createApp } from 'vue';
import App from './App.vue';

// styles for ruby elements
import bodyStyle from './body.css?inline'

// styles for widget
import styleCss from './style.css?inline'
import unoCss from 'virtual:uno.css?inline'
import { GM_addStyle } from '$';

// wrap widget in shadow DOM to avoid polluting page
const wrapper = document.createElement('div')
document.body.append(wrapper)
const shadow = wrapper.attachShadow({mode: 'open'})
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

const unoEle = addStyle(unoCss)
const styleEle = addStyle(styleCss)

// HMR for styles
if (import.meta.hot) {
  import.meta.hot!.accept([
    './style.css?inline', 
    '/__uno.css?inline',
  ],([styleCss, unoCss])=>{
    if (styleCss) {
      styleEle.textContent = styleCss.default
    }
    if (unoCss) {
      unoEle.textContent = unoCss.default
    }
  })
}