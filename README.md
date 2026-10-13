# HolyHell Studio

Website for HolyHell Studio and Lost Faith, in English, Simplified Chinese and Traditional Chinese.

Built with [Astro](https://astro.build). Pages are plain Astro/HTML/CSS; dev posts and lore are Markdown files.

## Running it locally

You need [Node.js](https://nodejs.org) 22.12 or newer.

```sh
npm install
npm run dev
```

Then open http://localhost:4321/HolyHellStudio/. The page reloads as you edit files. Drafts (`draft: true`) only show up here, never in the built site.

To check a production build:

```sh
npm run build
npm run preview
```

## Where things live

```
src/
  content/
    devlog/<post>/          one folder per post: en.md, sc.md, tc.md, plus its images
    lore/characters/<name>/ character pages
    lore/locations/<name>/  location pages
    lore/enemies/<slug>/    optional written lore for an enemy page
    team/members.yaml       team cards on the About page
  data/game/                game data from the sync script (don't edit by hand)
  assets/game/              card, item and enemy art from the sync script
  i18n/ui.ts                menu and button text in all three languages
  styles/global.css         colors and fonts
  site.ts                   email, social links, Steam link, search engine visibility
  pages/[...lang]/          one file per page; each builds all three languages
```

The studio logo goes at `src/assets/brand/studio-logo.svg`. Once it's there, it replaces the text in the header.

## Game data

Cards, equipment, materials and enemies come straight from the game's data tables, including the game's own translations. To update them, pull the latest `HolyHell` repo and run:

```sh
npm run sync-data
```

This reads from `../HolyHell` by default. If your clone is somewhere else:

```sh
HOLYHELL_PATH=/path/to/HolyHell npm run sync-data
```

The script only reads from the game repo. It writes `src/data/game/*.json` and copies art into `src/assets/game/`, then prints a summary (how many cards and items, and any missing art). Commit the result like any other change.

The summary also lists any text tokens the site doesn't know how to display yet (for example, if the game starts using a new `{something}` placeholder in card descriptions). Those would otherwise appear on the site as raw text, so they're worth passing on to whoever maintains the script.

Only content reachable from Windchime Village is included for now, and shops are left out until they're finished (`INCLUDE_SHOP`). To open up later regions, add their dungeon group to `IN_SCOPE_GROUPS` at the top of `scripts/sync-game-data.mjs`.

## Deploying

The site is meant for GitHub Pages under `llitten.github.io/HolyHellStudio`. Deployment isn't set up yet.

When the custom domain moves over, set `site` to the domain in `astro.config.mjs` and remove `base`. Before launch, set `noindex` to `false` in `src/site.ts` so search engines can find the site.

See [CONTRIBUTING.md](CONTRIBUTING.md) for writing posts and lore, and [docs/spec.md](docs/spec.md) for the original plan.
