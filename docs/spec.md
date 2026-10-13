# HolyHell Studio Website — Spec

Status: approved and implemented. Kept as a record of the original decisions; README and CONTRIBUTING describe how things work now.

## 1. Purpose & audience
- Official site for **HolyHell Studio** and its game **Lost Faith**.
- Content split: ~25% studio, ~75% Lost Faith.
- Primary visitor: **players interested in Lost Faith**.
- Future call to action: **Wishlist on Steam** (not live yet). The design leaves a slot for it, hidden until enabled.
- Reserved for later, not built at launch: analytics (privacy-friendly, e.g. GoatCounter), press kit page.

## 2. Languages
| Code | Language | URL prefix |
|---|---|---|
| `en` | American English (source language) | `/` |
| `sc` | Simplified Chinese | `/sc/` |
| `tc` | Traditional Chinese | `/tc/` |

- Language switcher in the header on every page, with three options. It links to the **same page** in the chosen language.
- Remembers the visitor's choice. On the first visit, suggests a language based on the browser's language setting, without forcing a redirect.
- Every page exists in all three languages. A translation that hasn't been reviewed shows a small "machine translated" note.

### Translation workflow
1. Author writes the English content in Markdown.
2. Claude translates it into `sc` and `tc`, each directly from English, and marks it `translation: machine`.
3. Changes go up as a GitHub **pull request**. The Taiwanese proofreader reviews both Chinese versions in the GitHub web UI.
4. On approval, the status changes to `translation: reviewed`, the PR is merged, and the site deploys automatically.
5. Game data pages (cards, items, enemies) use the game's own localization, so they don't go through this workflow.
6. Possible later addition: Pages CMS as a friendlier editor.

## 3. Navigation & pages
Nav: **Home · Lore · Dev Posts · About**. The footer on every page has the studio email, X, and Threads.

| Page | Notes |
|---|---|
| **Home** | Game first. 1) Lost Faith title (styled text until the logo is done) with a one-line pitch, over background art. 2) Short "about the game" section. 3) Latest 3 dev posts. 4) Lore entry points. 5) Small "Made by HolyHell Studio" strip linking to About. Steam wishlist slot hidden for now. |
| **Lore** | Wiki with sidebar navigation and cross-links. Sections below. |
| **Dev Posts** | Newest first, 20 per page. Each post has a cover image (fallback image if none) and tags. No author line (an author can go in the post body as a subheading if needed). No RSS or subscriptions. Supports images, looping video (converted from GIFs), and YouTube embeds. |
| **About** | Short studio info (plain facts, no mission statement; content TBD in a later conversation), then team cards (photo, then name, role, external links), then a Contact section. |
| **404** | Themed page in all three languages. |

No "Games" page, since the studio has one game.

### Dev post tags
Art, Programming, Design, Team, Audio, Narrative, Announcement, Playtest, Events.

### Lore sections
| Section | Layout | Source |
|---|---|---|
| **Characters** | Index page: a grid of portraits. Each links to a page with an infobox on the side. | Hand-written Markdown (Drive narrative docs as source material) |
| **Locations** | Individual pages. The combat background (1–2 images) as a wide banner, then description and lore, then enemies found there. | Hand-written Markdown + game data (enemy list) |
| **Enemies** | Individual pages with their own layout. Stats in an infobox. Skills and gameplay data at the bottom of the page. | Game data + optional hand-written lore |
| **Cards** | One scrolling grid page. | Game data |
| **Equipment** | One scrolling grid page. | Game data |
| **Materials** | One scrolling grid page. | Game data |

### Fields
- **Cards:** image, name, faction, godhood, durability, A-gauge increase, D-gauge increase, rarity, action cost, action type, description. No card lore.
- **Equipment:** image, name, type, attack, HP, defense, description, lore, how to get, price, rarity.
- **Materials** (incl. card packs and soul fragments): image, name, type, rarity, price, description, lore, how to get.
- **Enemies:** infobox with art, name, rank, HP, attack, defense. Below it: skills, behavior, and drops.
- **Rarity:** displayed as tiers. 1 is common, and higher numbers are rarer. There are no player-facing names.

## 4. Game data
- **Source:** the game repo's CSV exports (`HolyHell/Assets/Res_Local/Global/Tables/`), read from the local clone. The Drive sheets are only a fallback if the repo is unreachable.
- **Sync:** a script in the website repo copies the needed CSVs and art from the local `HolyHell` clone. It runs on demand, so updates go live only when the author syncs. It never writes to the game repo.
- **Localization:** names and descriptions come from `Localization/En.csv`, `Sc.csv`, and `Zh.csv`, using the same IDs the game uses (`Card_{id}`, `Item_{id}`, `ItemDes_{id}`, …).
- **Description templates** (`{effect1:2}`, `{keyword:X}`, etc.) are resolved the same way as the game's `BattleTextFormatter`.
- **Scope: content reachable from Windchime Village only** (`DungeonGroup` 1: Trails, Difficulty 1, Difficulty 2). Later regions (Dan Li Ting onward) are excluded until they're finished. Drive docs are used to cross-check what's in scope.
- **Excluded:** test entries, `DevOnly` dungeons, `WindChime_Tutorial2` (cut), Gold, and non-inherent `ExcludeFromPool` cards.
- **Inherent cards** (durability below 0, i.e. the starter cards) are included and labeled **Inherent** as their own category, even though they're `ExcludeFromPool`.
- **Art paths** (matching the game's loaders):
  - Cards: `Res_Local/Global/2D/Card/{CardDisplayArt or ID}.jpg`
  - Enemies: `Res_Local/Global/2D/Enemy/{Art or ID}.png`
  - Items: `Res_Local/Global/UI/Items/{SpriteID}.png`, tinted by `SpriteColor` when set
- **Missing art:** items with no `SpriteID` get a themed placeholder icon.
- **How to get:** worked out from the data. Covers the major sources only:
  - "Dropped by: [enemy]", from MonsterDrop, limited to in-scope enemies
  - "Shop", from the shop pools for Windchime; price filled in from BuyPrice
  - "Upgraded from: [item]", from ItemUpgrade
  - Fragment combining (5 fragments → 1 pack)
  - Dungeon rewards
- **Equipment stats:** the sum of the item's EquipmentEffect rows at base level (no enhancement).

## 5. Visual design
- **Mood:** dark, solemn, holy-meets-hellish.
- **Colors:**
  - Background `#666666`
  - Secondary: dark red (Claude proposes, author tweaks), used for surfaces, borders, buttons
  - Accent: gold (Claude proposes, author tweaks), used for headers, links, highlights
  - Body text is near-white. Every text/background pair is checked against WCAG AA contrast.
- **Fonts:** all font choices are defined as per-language variables in one place, so each can be swapped later with a one-line change.
  - Headers: **Chiron Sung HK** (Google Fonts). Verified to cover all of GB2312 (Simplified) and Big5 (Traditional), plus Latin.
  - Body: **Noto Serif / Noto Serif SC / Noto Serif TC** (Google Fonts).
- **Logos:**
  - Studio logo: **SVG**, with a PNG copy for social previews and the favicon.
  - Game logo: in progress. A styled "Lost Faith" text title stands in until it's ready, then gets swapped for the edited title screen or logo.
- Responsive layout that works on phones.

## 6. Tech
- **Astro** static site, with its built-in i18n routing. Kept plain: Astro + HTML + CSS only, with no React, Tailwind, or UI frameworks.
- Content stored as Markdown, one folder per entry holding `en.md`, `sc.md`, `tc.md` and its images. Game data is synced to JSON by `npm run sync-data`.
- UI strings (menus, buttons) in one translation file.
- Images optimized automatically (resized, converted to WebP/AVIF). GIFs converted to looping MP4/WebM. Long videos hosted on YouTube.
- **Hosting:** GitHub Pages from `LLitten/HolyHellStudio`. The repo is made public, and a GitHub Actions deploy runs on push to `main`.
  - Interim URL: `llitten.github.io/HolyHellStudio`, with a `noindex` tag until launch.
  - Later: move the custom domain over from Google Sites (DNS changes, with steps provided).
- Single maintainer (author). Commits go directly to `main`. Translation reviews go through PRs.
- SEO basics: per-language `<title>`/description, `hreflang` links between the language versions, social preview image, sitemap.

## 7. Code style & documentation
Goal: the repo should read like a small team wrote it by hand, not like generated output.

- **Code style:** plain, consistent naming. No boilerplate banner comments, no emoji, and no comments that just restate the code.
- **Comments:** only where something isn't obvious. Short and direct.
- **Docs live in normal GitHub places:**
  - `README.md`: what the project is, how to run it locally, how it deploys, how to sync game data.
  - `CONTRIBUTING.md`: the workflow (add a dev post, add a lore page, review translations).
  - `.github/pull_request_template.md`: checklist for posts.
  - Example content: one sample dev post and one sample lore page.
- **Commit messages:** short and imperative.

## 8. Assets
- Game repo (`koapower/HolyHell`, local clone, read-only): data tables, card art (`2D/Card`), enemy art (`2D/Enemy`).
- Lost Faith Google Drive: narrative docs, style guide, art, presentations. Used as source material and for cross-checking scope.
- Capstone Documents folder: game and team info only. Anything taken from it is shown to the author before publishing.
- Local `HolyHellArt` folder: backgrounds, characters, item icons, UI.
- Studio logo (SVG/PNG): to be added by the author.

## 9. Open items
- [ ] Final dark red and gold values (Claude proposes during build)
- [ ] Team member list, photos, links
- [ ] Studio logo files
- [ ] Studio info text (separate conversation)
- [ ] Domain registrar access for the DNS switch, when ready
