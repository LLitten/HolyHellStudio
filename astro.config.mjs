import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

// While the site lives on GitHub Pages under the repo name, every URL starts with /HolyHellStudio.
// When the custom domain is moved over, set `site` to the domain and delete `base`.
export default defineConfig({
  site: 'https://llitten.github.io',
  base: '/HolyHellStudio',
  trailingSlash: 'always',
  i18n: {
    // Adding a language: add it here, in src/i18n/ui.ts, and in LANGS in scripts/sync-game-data.mjs.
    locales: ['en', 'sc', 'tc'],
    defaultLocale: 'en',
    routing: { prefixDefaultLocale: false },
  },
  integrations: [mdx()],
});
