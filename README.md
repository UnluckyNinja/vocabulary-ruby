# Vocabulary Ruby

A Tampermonkey userscript that imports CSV dictionaries and automatically annotates matching words on web pages with `<ruby>` elements.

## Project Structure

This project is a monorepo managed by `pnpm`.

- `packages/userscript`: The main userscript project (Using `vite-plugin-monkey`).

## Usage

### Preset
A preset is a configuration composed with some **website filters** to determine what websites and which part of it to process, and **dictionaries** to translate text.

Preset can be specified with one or more remote sources to append above settings.

### Website Filter

## Develop locally

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

## Dependencies

- **Vue 3**
- **Vite** + **vite-plugin-monkey**
- **Reka-UI** (Headless UI)
- **UnoCSS** (Utility CSS)
- **fflate** (Compression)
