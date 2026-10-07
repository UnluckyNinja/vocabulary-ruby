const wrapper = document.createElement('div')
wrapper.style.setProperty('z-index', '999999', 'important')
wrapper.style.setProperty('position', 'absolute', 'important')
wrapper.style.setProperty('top', '0px', 'important')
wrapper.style.setProperty('left', '0px', 'important')
wrapper.style.setProperty('width', '0px', 'important')
wrapper.style.setProperty('height', '0px', 'important')
const shadowRoot = document.documentElement.appendChild(wrapper).attachShadow({ mode: 'open' })
const element = document.createElement('div')
element.id = 'vocabulary-ruby'
element.classList.add('isolate')
element.classList.add('font-sans')
shadowRoot.appendChild(element)

const fontSize = window.getComputedStyle(document.documentElement).fontSize

element.style.setProperty('--vb-scale', (16 / Math.min(parseFloat(fontSize), 16)).toString())

export { wrapper, shadowRoot, element as portalTarget }
