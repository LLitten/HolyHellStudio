# Contributing

## Writing a dev post

1. Copy `src/content/devlog/example-post/` and rename the folder. The folder name becomes the URL, so keep it short and lowercase, e.g. `2026-11-combat-rework`.
2. Edit `en.md`. The fields at the top:

   | Field | |
   |---|---|
   | `title` | Post title |
   | `date` | `YYYY-MM-DD` |
   | `summary` | One or two sentences for the post list |
   | `tags` | Any of `art`, `programming`, `design`, `team`, `audio`, `narrative`, `announcement`, `playtest`, `events`, `patch-notes` |
   | `gameVersion`, `gameCommit` | Patch notes only: the game version and the HolyHell commit they cover up to |
   | `cover` | Optional, e.g. `./cover.jpg`. Without one, the post uses the default cover |
   | `draft` | `true` keeps it out of the built site |

3. Put images in the same folder and link them with `![description](./image.png)`. Full-size screenshots are fine; the build resizes them.
4. Remove `draft: true` when it's ready.

### GIFs and video

Convert GIFs to MP4. They look the same and are usually 10–20 times smaller. With [ffmpeg](https://ffmpeg.org):

```sh
ffmpeg -i clip.gif -movflags faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" clip.mp4
```

A post with a video needs to be `.mdx` instead of `.md` (just rename it). Then:

```mdx
import clip from './clip.mp4';

<video src={clip} autoplay loop muted playsinline></video>
```

Longer videos belong on YouTube:

```html
<iframe src="https://www.youtube-nocookie.com/embed/VIDEO_ID" title="Trailer" allowfullscreen></iframe>
```

## Translations

Each page has an English original and a file per Chinese version in the same folder. The `translation` field tracks where each one stands:

- `source`: the English original
- `machine`: translated but not proofread. The page shows a small notice saying so.
- `reviewed`: proofread. The notice goes away.

If a Chinese file is missing, the English version shows on the Chinese site with a notice.

### Review process

1. Translations go up as a pull request with `translation: machine`.
2. The reviewer opens the pull request on GitHub, goes to **Files changed**, and either suggests edits on a line or edits the file directly (the `...` menu on a file, then **Edit file**).
3. Once a file is checked, change `machine` to `reviewed` and merge.

Game text (cards, items, enemies) comes from the game's own localization, so it doesn't need reviewing here.

## Lore pages

**Characters**: a folder in `src/content/lore/characters/` with a portrait image and `en.md`:

```md
---
name: Vash
portrait: ./portrait.png
infobox:
  - label: Role
    value: Protagonist
order: 1
---
```

`infobox` rows show in the side panel. `order` sets the position in the portrait grid.

**Locations**: a folder in `src/content/lore/locations/`. Add `banner: ./banner.png` for the combat background, and `dungeonGroup` to list the location's areas and enemies from the game data.

**Enemies**: enemy pages are built from game data. To add written lore, make a folder in `src/content/lore/enemies/` named after the enemy's page (the last part of its URL, e.g. `volva-the-torrent`) with an `en.md`.

## The About page

The studio introduction is `src/content/studio/about/` (en.md, sc.md, tc.md), translated and reviewed like any other page.

People are listed in `src/content/team/members.yaml`. `group` sets where someone appears: `core` cards come first, `team` cards on the row below, and `contributor` is listed under Contributors, grouped by `discipline`. Photos go in `src/content/team/photos/`; without one, the card shows the studio emblem.

Only list someone once they've agreed to be named. Until then, keep `draft: true` on their entry: they'll show in `npm run dev` but not on the built site. Never put emails, Discord names or other private contact details in this file.

## Menu and button text

All interface text is in `src/i18n/ui.ts`, with one block per language. Add a new key to all three blocks.

Labels for game terms (Cost, Durability, Angel Meter, item types, Elite, Boss and so on) aren't in that file. They come from the game's own translations through the data sync, so the site always uses the same words as the game. To change one, change it in the game's `LanguageParam` sheet. The list of labels is `LABELS` in `scripts/sync-game-data.mjs`.
