import { readonly, ref } from 'vue'
import { Matcher, MatchResult } from './matcher'

export class DOMObserver {
  private running = ref(false)
  private matcher!: Matcher
  private observer: MutationObserver
  private intersectionObserver: IntersectionObserver
  private processedElements: WeakSet<Element> = new WeakSet()
  private rootSelector: string = ''
  private targetSelector: string = ''
  private ignoreSelector: string = ''

  private _status = { running: readonly(this.running) }
  get status() {
    return this._status
  }

  constructor() {
    // Observe DOM mutations to find new text nodes
    this.observer = new MutationObserver(this.handleMutations.bind(this))

    // Lazy process visible elements
    this.intersectionObserver = new IntersectionObserver(this.handleIntersections.bind(this), {
      rootMargin: '200px', // Pre-load slightly before visible
    })
  }

  start(
    matcher: Matcher,
    options: {
      rootSelector?: string
      targetSelector?: string
      ignoreSelector?: string
    } = {},
  ) {
    this.running.value = true
    this.matcher = matcher
    this.rootSelector = options.rootSelector ?? ''
    this.targetSelector = options.targetSelector ?? ''
    this.ignoreSelector = options.ignoreSelector ?? ''
    if (this.rootSelector) {
      const elements = [...document.querySelectorAll(this.rootSelector)].filter(
        el => !el.parentElement?.closest(this.rootSelector),
      )
      elements.forEach(ele => {
        this.observer.observe(ele, {
          childList: true,
          subtree: true,
          characterData: true,
        })
      })
    } else {
      this.observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true,
      })
    }

    // Initial scan
    this.scanNode(document.body)
  }

  stop() {
    this.rootSelector = ''
    this.targetSelector = ''
    this.ignoreSelector = ''
    this.observer.disconnect()
    this.intersectionObserver.disconnect()
    this.cleanup()
    this.running.value = false
  }

  private handleMutations(mutations: MutationRecord[]) {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(node => this.scanNode(node))
      } else if (mutation.type === 'characterData') {
        const parentEle = mutation.target.parentElement
        if (parentEle) {
          this.processedElements.delete(parentEle)
          this.scanNode(parentEle)
        }
      }
    }
  }

  private scanNode(node: Node) {
    // Skip script, style, existing ruby, etc.
    const parent = node.parentElement
    if (
      parent &&
      (parent.tagName === 'SCRIPT' ||
        parent.tagName === 'STYLE' ||
        parent.tagName === 'RUBY' ||
        parent.tagName === 'RT' ||
        parent.tagName === 'TEXTAREA' ||
        parent.tagName === 'INPUT' ||
        parent.isContentEditable)
    )
      return
    if (parent && this.processedElements.has(parent)) return

    // skip specified ignore selector
    if (this.ignoreSelector) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const ele = node as Element
        if (ele.matches(this.ignoreSelector)) {
          return
        }
      }
    }
    checking: if (node.nodeType === Node.TEXT_NODE) {
      if (node.nodeValue?.trim() && parent) {
        if (this.targetSelector && !parent.matches(this.targetSelector)) {
          break checking
        }
        this.intersectionObserver.observe(parent)
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      // Recurse
      node.childNodes.forEach(child => this.scanNode(child))
    }
  }

  private handleIntersections(entries: IntersectionObserverEntry[]) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target
        this.intersectionObserver.unobserve(element)

        this.processElement(element as HTMLElement)
      }
    })
  }

  private processElement(element: HTMLElement) {
    if (this.processedElements.has(element)) return
    this.processedElements.add(element) // Mark as processed

    const nodes = element.childNodes
    for (const node of nodes) {
      if (node.nodeType !== Node.TEXT_NODE) continue

      // Process matching
      const text = node.textContent || ''
      if (!text.trim()) continue

      const matches = this.matcher(text)
      if (matches.length > 0) {
        this.injectRuby(node as Text, matches)
      }
    }
  }

  private injectRuby(node: Text, matches: MatchResult[]) {
    // Save original for restoration
    const originalText = node.textContent || ''
    const parent = node.parentNode
    if (!parent) return

    const container = document.createElement('span')
    container.dataset.vRubyOriginal = originalText
    container.className = 'v-ruby-wrapper' // Minimal style

    let lastIndex = 0
    matches
      .sort((a, b) => a.start - b.start)
      .forEach(match => {
        // Text before
        if (match.start > lastIndex) {
          container.appendChild(document.createTextNode(originalText.slice(lastIndex, match.start)))
        }

        // Ruby element
        const ruby = document.createElement('ruby')
        ruby.textContent = originalText.slice(match.start, match.end)
        const rt = document.createElement('rt')
        rt.textContent = match.translation
        ruby.appendChild(rt)
        container.appendChild(ruby)

        lastIndex = match.end
      })

    // Text after
    if (lastIndex < originalText.length) {
      container.appendChild(document.createTextNode(originalText.slice(lastIndex)))
    }

    parent.replaceChild(container, node)
    this.processedElements.add(container) // Mark wrapper as processed
  }

  /**
   * Restores the DOM to its original state.
   */
  cleanup() {
    const wrappers = document.querySelectorAll('.v-ruby-wrapper')
    wrappers.forEach(wrapper => {
      const originalText = (wrapper as HTMLElement).dataset.vRubyOriginal
      if (originalText) {
        const textNode = document.createTextNode(originalText)
        wrapper.replaceWith(textNode)
      }
    })
    this.processedElements = new WeakSet() // Reset processed
  }
}
