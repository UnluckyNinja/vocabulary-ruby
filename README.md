# Vocabulary Ruby

A Tampermonkey userscript that imports CSV dictionaries and automatically annotates matching words on web pages with `<ruby>` elements.

## Project Structure

This project is a monorepo managed by `pnpm`.

- `packages/userscript`: The main userscript project (Vue + Vite + UnoCSS).

## Getting Started

1. **Install Dependencies:**
   ```bash
   pnpm install
   ```

2. **Development:**
   ```bash
   cd packages/userscript
   pnpm dev
   ```
   This will start a dev server and provide a link to install the userscript in Tampermonkey. Changes will be hot-reloaded.

3. **Build:**
   ```bash
   cd packages/userscript
   pnpm build
   ```
   The built userscript will be in `packages/userscript/dist/userscript.user.js`.

## Configuration

1. Click the floating "Translate" icon in the top-right corner.
2. Toggle "Enable Plugin".
3. Add URLs to your CSV dictionaries (e.g., `https://example.com/dict.csv`).
4. Click "Reload Dictionary".

## Customization

- **Matching Logic:** The current matching logic in `src/engine/matcher.ts` is a placeholder. You **must** implement your own efficient text matching algorithm (e.g., Trie-based) to handle large dictionaries effectively.

## Tech Stack

- **Vue 3**
- **Vite** + **vite-plugin-monkey**
- **Reka-UI** (Headless UI)
- **UnoCSS** (Utility CSS)
- **fflate** (Compression)
