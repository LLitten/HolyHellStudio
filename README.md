# HolyHell Studio

Website for HolyHell Studio and Lost Faith, in English, Simplified Chinese and Traditional Chinese.

Built with [Astro](https://astro.build). Pages are plain Astro/HTML/CSS; dev posts and lore are Markdown files.

## Running it locally

You need [Node.js](https://nodejs.org) 22.12 or newer.

```sh
npm install
npm run dev
```

Then open http://localhost:4321/. The page reloads as you edit files. Drafts (`draft: true`) only show up here, never in the built site.

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
    studio/about/           the studio introduction on the About page
    team/members.yaml       everyone on the team, shown on the About page
  data/game/                game data from the sync script (don't edit by hand)
  assets/game/              card, item and enemy art from the sync script
  i18n/ui.ts                menu and button text in all three languages
  styles/global.css         colors and fonts
  site.ts                   email, social links, demo build, Steam link, search engine visibility
  pages/[...lang]/          one file per page; each builds all three languages
```

The Lost Faith logo is `src/assets/brand/lost-faith-logo.svg` (the full lockup used on the home page) and `lost-faith-title.svg` (the lettering on its own). Both are the white versions from Lost Faith > Admin > Distribution on Drive, where the black versions and PNGs also live. `lost-faith-frame.svg` is the logo without the lettering (made from the logo file); the Chinese home pages put their title inside it. The home page draws these files inline and colors them gold, so keep them white.

The studio logo is `src/assets/brand/studio-logo.svg` (the white version from Drive, Admin > Distribution). The tab icon and home-screen icon in `public/` were made from it. The default share image, `public/og-default.jpg`, is a crop of the game's title screen.

## Game data

Cards, equipment, materials and enemies come straight from the game's data tables, including the game's own translations. To update them, get the latest `main` of `koapower/HolyHell` from GitHub, download its art (stored in Git LFS), and run the sync:

```sh
git -C ../HolyHell pull
git -C ../HolyHell lfs pull --include="HolyHell/Assets/Res_Local/Global/**,HolyHell/Assets/Arts/UI/MainMenu/TitleScreen.png"
npm run sync-data
```

This reads from `../HolyHell` by default. If your clone is somewhere else:

```sh
HOLYHELL_PATH=/path/to/HolyHell npm run sync-data
```

The script only reads from the game repo. It writes `src/data/game/*.json` and copies art into `src/assets/game/` (including the title screen used on the home page), then prints a summary (how many cards and items, and any missing art). Commit the result like any other change.

The summary also lists any text tokens the site doesn't know how to display yet (for example, if the game starts using a new `{something}` placeholder in card descriptions). Those would otherwise appear on the site as raw text, so they're worth passing on to whoever maintains the script.

Only content reachable from Windchime Village is included for now, and shops are left out until they're finished (`INCLUDE_SHOP`). To open up later regions, add their dungeon group to `IN_SCOPE_GROUPS` at the top of `scripts/sync-game-data.mjs`.

## Deploying

Every push to `main` builds the site and publishes it to GitHub Pages at https://holyhellstudio.net (`.github/workflows/deploy.yml`). Progress and errors show in the repo's Actions tab. Drafts are left out of the published site.

The domain's DNS is on Cloudflare: the bare domain points to GitHub Pages' A and AAAA addresses and `www` is a CNAME to `llitten.github.io`, all set to DNS only (no orange cloud) so GitHub can issue the HTTPS certificate. GitHub redirects `www` to the bare domain.

Before launch, set `noindex` to `false` in `src/site.ts` so search engines can find the site.

See [CONTRIBUTING.md](CONTRIBUTING.md) for writing posts and lore, and [docs/spec.md](docs/spec.md) for the original plan.
