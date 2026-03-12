import { Matcher, MatchResult } from './matcher';

export class DOMObserver {
  private matcher: Matcher;
  private observer: MutationObserver;
  private intersectionObserver: IntersectionObserver;
  private processedElements: WeakSet<Element> = new WeakSet();

  constructor(matcher: Matcher) {
    this.matcher = matcher;

    // Observe DOM mutations to find new text nodes
    this.observer = new MutationObserver(this.handleMutations.bind(this));
    
    // Lazy process visible elements
    this.intersectionObserver = new IntersectionObserver(this.handleIntersections.bind(this), {
      rootMargin: '200px', // Pre-load slightly before visible
    });
  }

  start() {
    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true, // Also watch for text content changes? Usually overkill for new nodes, but maybe needed for dynamic text updates.
    });
    
    // Initial scan
    this.scanNode(document.body);
  }

  stop() {
    this.observer.disconnect();
    this.intersectionObserver.disconnect();
    this.cleanup();
  }

  private handleMutations(mutations: MutationRecord[]) {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(node => this.scanNode(node));
      } else if (mutation.type === 'characterData') {
        this.scanNode(mutation.target);
      }
    }
  }

  private scanNode(node: Node) {
    
    // Skip script, style, existing ruby, etc.
    const parent = node.parentElement;
    if (parent && (
      parent.tagName === 'SCRIPT' || 
      parent.tagName === 'STYLE' || 
      parent.tagName === 'RUBY' || 
      parent.tagName === 'RT' ||
      parent.tagName === 'TEXTAREA' ||
      parent.tagName === 'INPUT' ||
      parent.isContentEditable
    )) return;
    if (parent && this.processedElements.has(parent)) return;

    if (node.nodeType === Node.TEXT_NODE) {
      if (node.nodeValue?.trim() && parent) {
        this.intersectionObserver.observe(parent);
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      // Recurse
      node.childNodes.forEach(child => this.scanNode(child));
    }
  }

  private handleIntersections(entries: IntersectionObserverEntry[]) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target;
        this.intersectionObserver.unobserve(element);
        
        this.processElement(element as HTMLElement);
      }
    });
  }

  private processElement(element: HTMLElement) {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null);
    if (this.processedElements.has(element)) return;
    this.processedElements.add(element); // Mark as processed (actually replaced nodes are gone/changed)
    let node: Node | null;
    while(node = walker.nextNode()) {

      // only process text nodes in the same level, or ruby nodes might be traversed
      if(node.parentElement !== element) return

      // Process matching
      const text = node.textContent || '';
      if (!text.trim()) continue;

      const matches = this.matcher(text);
      if (matches.length > 0) {
        this.injectRuby(node as Text, matches);
      }
    }
  }

  private injectRuby(node: Text, matches: MatchResult[]) {
    // Save original for restoration
    const originalText = node.textContent || '';
    const parent = node.parentNode;
    if (!parent) return;
    
    const container = document.createElement('span');
    container.dataset.vRubyOriginal = originalText;
    container.className = 'v-ruby-wrapper'; // Minimal style
    
    let lastIndex = 0;
    matches.sort((a, b) => a.start - b.start).forEach(match => {
      // Text before
      if (match.start > lastIndex) {
        container.appendChild(document.createTextNode(originalText.slice(lastIndex, match.start)));
      }
      
      // Ruby element
      const ruby = document.createElement('ruby');
      ruby.textContent = originalText.slice(match.start, match.end);
      const rt = document.createElement('rt');
      rt.textContent = match.translation;
      ruby.appendChild(rt);
      container.appendChild(ruby);
      
      lastIndex = match.end;
    });
    
    // Text after
    if (lastIndex < originalText.length) {
      container.appendChild(document.createTextNode(originalText.slice(lastIndex)));
    }
    
    parent.replaceChild(container, node);
    this.processedElements.add(container); // Mark wrapper as processed
  }

  /**
   * Restores the DOM to its original state.
   */
  cleanup() {
    const wrappers = document.querySelectorAll('.v-ruby-wrapper');
    wrappers.forEach(wrapper => {
      const originalText = (wrapper as HTMLElement).dataset.vRubyOriginal;
      if (originalText) {
        const textNode = document.createTextNode(originalText);
        wrapper.replaceWith(textNode);
      }
    });
    this.processedElements = new WeakSet(); // Reset processed
  }
}
