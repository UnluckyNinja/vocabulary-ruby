const shadowRoot = document.body
  .appendChild(document.createElement('div'))
  .attachShadow({ mode: 'open' });
const element = document.createElement('div')
shadowRoot.appendChild(element)

export { shadowRoot, element as portalTarget }