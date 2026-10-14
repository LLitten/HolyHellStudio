import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://holyhellstudio.net',
  trailingSlash: 'always',
  i18n: {
    // Adding a language: add it here, in src/i18n/ui.ts, and in LANGS in scripts/sync-game-data.mjs.
    locales: ['en', 'sc', 'tc'],
    defaultLocale: 'en',
    routing: { prefixDefaultLocale: false },
  },
  integrations: [mdx()],
});
