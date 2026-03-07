import { Matcher, MatchResult } from './matcher';

export class DOMObserver {
  private matcher: Matcher;
  private observer: MutationObserver;
  private intersectionObserver: IntersectionObserver;
  private pendingNodes: Set<Node> = new Set();
  private processedNodes: WeakSet<Node> = new WeakSet();

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
    if (this.processedNodes.has(node)) return;
    
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

    if (node.nodeType === Node.TEXT_NODE) {
      // Text node found. Check if it's visible?
      // For now, let's process it directly or queue it?
      // IntersectionObserver works on Elements, not Text nodes directly.
      // So we observe the parent Element.
      if (parent) {
        // If parent is already observed, we might re-trigger.
        // Actually, let's simplify: scan text nodes, if valid, check matches.
        // If matches found, THEN inject.
        // But matching might be expensive.
        
        // Strategy:
        // 1. Find text nodes.
        // 2. Check if parent is visible using IntersectionObserver.
        // 3. If visible, process text.
        
        // Map parent element to its text nodes?
        // Or just observe the parent.
        this.intersectionObserver.observe(parent);
        // We need to associate the text node with this observation logic.
        // Maybe store it on the element?
        // Let's use a simpler approach: process immediately if "lazy" isn't strictly required for *finding*,
        // but for *rendering*.
        
        // Actually, the requirement says "Lazy: Use IntersectionObserver to trigger actual translating".
        // So:
        this.pendingNodes.add(node);
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
        
        // Find pending text nodes that belong to this element
        // Since we can't easily map back from element to pending text nodes without a map,
        // let's re-scan the element for text nodes or keep a map.
        
        // Better: When scanning, if we find a text node, add it to a map: Map<Element, Set<TextNode>>.
        // But nodes might move.
        
        // Let's iterate pendingNodes and check if their parent is the intersecting element.
        // This is O(N) where N is total pending text nodes. Might be slow.
        
        // Optimization: 
        // Just process the element's subtree for text nodes NOW.
        // But we already scanned it.
        
        // Let's refine `scanNode`:
        // If we find a text node, and its parent is not yet observed, observe the parent.
        // When parent becomes visible, process ALL its text node children.
        
        this.processElement(element as HTMLElement);
      }
    });
  }

  private processElement(element: HTMLElement) {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null);
    let node: Node | null;
    while(node = walker.nextNode()) {
       if (this.processedNodes.has(node)) continue;
       
       // Process matching
       const text = node.textContent || '';
       if (!text.trim()) continue;

       const matches = this.matcher(text);
       if (matches.length > 0) {
         this.injectRuby(node as Text, matches);
         this.processedNodes.add(node); // Mark as processed (actually replaced nodes are gone/changed)
       }
    }
  }

  private injectRuby(node: Text, matches: MatchResult[]) {
    // Save original for restoration
    const originalText = node.textContent || '';
    const parent = node.parentNode;
    if (!parent) return;

    // We can't easily restore if we split the node into many pieces.
    // Instead of replacing the node with a frag, let's keep track of the *parent* and its original HTML?
    // That's risky for dynamic apps.
    // Better: Wrap the whole thing in a <span data-v-ruby-container>?
    // Or just remember the original text content of this specific text node?
    // But we replace the text node with multiple nodes (text, ruby, text...).
    
    // Restoration strategy:
    // When injecting, replace `node` with a `<span>` containing the ruby structure?
    // Then restoration is just `span.replaceWith(originalText)`.
    // Let's try that.
    
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
    this.processedNodes.add(container); // Mark wrapper as processed
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
    this.processedNodes = new WeakSet(); // Reset processed
  }
}
