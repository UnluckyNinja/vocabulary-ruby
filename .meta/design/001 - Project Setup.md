# Vocabulary Ruby - Design Document

## 1. Project Overview
A Tampermonkey userscript that imports CSV dictionary files (key-value pairs) and automatically annotates matching words on web pages with `<ruby>` elements for translation/pronunciation.

### Original User Prompt
> 我在开发一款油猴插件，主要功能是指定地址导入任意数量csv文件，文件中包含键值对指定翻译词库，然后根据词库在网页上对应位置添加ruby元素来标记词语进行翻译。使用vite和vite-plugin-monkey进行项目搭建，reka-ui作为UI框架，unocss作为工具样式库。并包含不干扰用户使用的，在页面右上角浮动的UI元素，并可以通过tampermonkey的菜单功能实现是否在当前页面下启用。请帮我敲定一份设计文档，位于@.meta/design/ 下，包含项目搭建、实现方式、UI设计等细则，就像网上的AI开发实践中，通过plan mode先让agent编写设计文档的方式那样，并记录本段prompt于该文档中。此外，DOM监听和设置等功能可以参考kiss-translator的实现。

---

## 2. Tech Stack & Scaffolding
- **Build Tool:** [Vite](https://vitejs.dev/) + [vite-plugin-monkey](https://github.com/lisonge/vite-plugin-monkey)
- **Language:** TypeScript (ESM)
- **UI Framework:** [Reka-UI](https://reka-ui.com/) (for accessible, headless UI components)
- **Styling:** [UnoCSS](https://unocss.dev/) (for utility-first CSS, optimized for userscripts)
- **Package Manager:** pnpm (preferred)

### Project Initialization
```bash
# Using vite-plugin-monkey template
pnpm create monkey vocabulary-ruby --template vue-ts # Using Vue for Reka-UI integration
cd vocabulary-ruby
pnpm install reka-ui unocss @unocss/reset @unocss/preset-uno
```

---

## 3. Core Implementation Strategy

### 3.1 Dictionary Management
- **Import:** Support importing arbitrary CSV files via HTTP URL.
- **Parsing:** Use a lightweight CSV parser or simple string splitting (since it's key-value based).
- **Storage:** Store parsed dictionaries and configuration using `GM_setValue`/`GM_getValue` to ensure persistence across sessions and domains.
- **Memory Optimization:** Using fflate to compress parsed csv files and then put it in the storage.
- **Translation:** Leave blank for user to implement (It will be a asynchronous step that pass in string array and returns a function to be called with text to search in).
- **Reloadable:** Dictionary should be reloadable without the need to refresh the page, when users modified import list.

### 3.2 DOM Observation & Manipulation (Inspired by `kiss-translator` and `katakana-terminator`)
- **Observation:** Use `MutationObserver` to detect dynamic content loading. 
- **Traversal:** Recursively scan text nodes (`Node.TEXT_NODE`). Avoid scanning script, style, and already-rubied elements.
- **Lazy:** Use `IntersectionObserver` to trigger actual translating when they are visible to users. 
- **Injection:** 
  - Locate target words by using a placeholder function, pass in text and returns a list of start end pairs. Function body will be implemented by user.
    (It will be using the returned function from the dictionary processing step.)
  - Wrap words in `<ruby>` tags: `<ruby>Word<rt>Translation</rt></ruby>`.
  - Style `<ruby>` and `<rt>` to be visually distinct but non-intrusive.
- **Removable:** It shoudld be able to restore to initial state before stated translating, without user refreshing explicitly.

### 3.3 State Management
- **Toggle System:** 
  - Global enable/disable state.
  - URL regex based whitelist/blacklist.
  - Integration with `GM_registerMenuCommand` to toggle enablement directly from the Tampermonkey menu.

---

## 4. UI/UX Design

### 4.1 Floating Widget (Floating Action Button)
- **Location:** Top-right corner of the viewport.
- **Style:** Small, semi-transparent icon/button that expands on hover or click. Use UnoCSS for "glassmorphism" or a clean, modern look.
- **Z-Index:** Set to a very high value (e.g., `2147483647`) to stay on top of all page elements.
- **Running State Notification:** Some steps may require seconds to minute, keep the user up with current program state by showing messages.

### 4.2 Configuration Panel (Reka-UI)
- **Components:**
  - **Dialog/Popover:** For the main settings interface.
  - **Switch:** To toggle the plugin on/off.
  - **Input/Button List:** For managing CSV URLs.
  - **Toast:** For status updates (e.g., "Dictionary Updated", "CSV Loaded").
- **Accessibility:** Leverage Reka-UI's primitives to ensure the UI is keyboard-navigable and screen-reader friendly.

---

## 5. Development Roadmap

### Phase 1: Infrastructure & Scaffolding
- Initialize the project using `vite-plugin-monkey` with the Vue-TS template.
- Configure UnoCSS with necessary presets and `fflate` for compression utilities.
- Implement a robust `GM_storage` wrapper with `fflate` integration to handle compressed dictionary persistence.

### Phase 2: Dictionary Engine & Translation Logic
- Develop the CSV fetching and parsing module with support for multiple URLs.
- Implement the asynchronous dictionary processing pipeline:
  - Fetch -> Parse -> Compress -> Store.
  - Create the "Placeholder Function" interface for text matching (start-end pairs).
- Build the "Reloadable" logic to update the engine state without a full page refresh.

### Phase 3: DOM Observation & Lazy Rendering
- Implement the `MutationObserver` to track new content.
- Develop the `IntersectionObserver` logic (Lazy Loading) to only apply `<ruby>` annotations when elements enter the viewport.
- Create the "Removable" logic: implement a mechanism to track modified nodes and restore original text nodes/elements when the plugin is disabled or reloaded.

### Phase 4: UI Development (Reka-UI)
- Design and build the floating FAB with glassmorphism using UnoCSS.
- Implement the "Running State Notification" system to provide feedback during long-running tasks (e.g., "Fetching CSV...", "Compressing...").
- Build the Reka-UI configuration panel (Dialogs, Switches, URL List Management).

### Phase 5: Integration & Polish
- Connect `GM_registerMenuCommand` to the internal toggle state.
- Implement URL Regex-based whitelist/blacklist filtering.
- Performance profiling for large pages and heavy dictionaries.

---

## 6. Key Considerations

### 6.1 Performance & Memory
- **Compression:** Use `fflate` to keep the `GM_storage` footprint small, as userscripts often have storage limits.
- **Lazy Execution:** The combination of `IntersectionObserver` and asynchronous matching is critical to prevent "Jank" or freezing on text-heavy sites.
- **Throttling:** Ensure `MutationObserver` callbacks are throttled to handle rapid DOM changes (e.g., infinite scroll).

### 6.2 Stability & Conflict Resolution
- **State Restoration:** The "Removable" feature must be surgical. Ensure that removing `<ruby>` tags doesn't break page-specific event listeners or layout.
- **Z-Index Wars:** The floating widget must use the maximum possible z-index but also handle cases where site headers might overlap it.

### 6.3 Security
- **Data Sanitization:** When converting CSV text to `<rt>` content, ensure proper escaping to prevent XSS if the CSV source is untrusted.
- **CSP Compliance:** Ensure the script's resource fetching (CSV via HTTP) is handled gracefully in environments with strict Content Security Policies.

### 6.4 User Experience
- **Non-Intrusive:** The floating UI should be draggable or positioned such that it doesn't block critical "Back to top" buttons or site navigation.
- **Feedback:** Asynchronous steps (like processing 10k+ words) must have clear visual progress to prevent the user from thinking the script has crashed.

