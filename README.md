# Vocabulary Ruby

A Tampermonkey userscript that imports CSV dictionaries and automatically annotates matching words on web pages with `<ruby>` elements.

## Usage

[Install script manager (Tampermonkey, Vilentmonkey)](https://greasyfork.org/)
Install script from https://greasyfork.org/zh-CN/scripts/601005 or github release

1. Add a dictionary
2. Create a site rule for it, or use it in the floating panel directly.

## Project Structure

This project is a monorepo managed by `pnpm`.

- `packages/userscript`: The main userscript project (Using `vite-plugin-monkey`).

## Develop locally

you can use [VitePlus](https://viteplus.dev/) or pnpm

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
   The built userscript will be in `packages/userscript/dist/vocabulary-ruby.user.js`.

## Main Dependencies

- **Vue 3**
- **Vite** + **vite-plugin-monkey**
- **Nuxt UI**
- **UnoCSS**
