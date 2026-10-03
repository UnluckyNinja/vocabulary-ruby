const wrapper = document.createElement('div')
const shadowRoot = document.body.appendChild(wrapper).attachShadow({ mode: 'open' })
const element = document.createElement('div')
element.id = 'vocabulary-ruby'
element.classList.add('isolate')
shadowRoot.appendChild(element)

export { shadowRoot, element as portalTarget }
