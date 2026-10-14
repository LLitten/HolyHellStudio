# Notes for AI assistants

Read README.md and CONTRIBUTING.md first; they cover how the site works. This file covers the rules and decisions that aren't obvious from the code.

## Working with the team

- Ask before building anything that isn't clearly specified. Confirm requirements first.
- Don't commit, push, deploy or change repo settings unless asked to in the current conversation.
- Commit messages are short and imperative ("Add lore section index").

## The game repo (koapower/HolyHell)

- Read only. Never edit, commit to, pull or otherwise write to the game repo from this project. Pulling it is left to the user.
- `scripts/sync-game-data.mjs` reads from a local clone (`../HolyHell` or `HOLYHELL_PATH`) and writes only to this repo.
- The game's CSVs come from Google Sheets via the game repo's own tooling (see its AGENTS.md). The site reflects what has been pulled into the repo, not the live sheets. Never fix game data on the website side; problems get reported to the team.
- `src/data/game/` and `src/assets/game/` are generated. Change the sync script and re-run it instead of editing them.

## Game data scope

- Only content reachable from Windchime Village (dungeon group 1) is shown. Later regions are unfinished. Widen `IN_SCOPE_GROUPS` only when told to.
- Shops are hidden until they're finished (`INCLUDE_SHOP = false`).
- Debug entries have no flag in the data. They're named with an `xdd` prefix and filtered by name.
- Inherent cards (durability below 0) are shown even though they're `ExcludeFromPool`. That flag means "not in card packs", not "unplayable".
- Some names that look like typos are intentional ("Hound Masta"). Show game text as it is.

## Wording and languages

- Languages are `en`, `sc` (Simplified) and `tc` (Traditional) in URLs, file names and code. `<html lang>` and hreflang stay `zh-Hans` / `zh-Hant`.
- The game's title is Lost Faith / 弃誓神途 / 棄誓神途.
- Use the game's own terms (Angel Meter, Cost, Durability, ATK, 素材 in Traditional, and so on). Labels for game terms come from the game's localization through `LABELS` in the sync script, not from `src/i18n/ui.ts`.
- New site text goes into all three language blocks in `src/i18n/ui.ts`.
- Translations of posts and lore start as `translation: machine`. Only the team's proofreader marks them `reviewed`.
- When writing lore, stick to what the game's own text or the team's docs say. Don't invent story details.

## Patch notes

- Only write them when asked. They're dev posts tagged `patch-notes`.
- Each one records `gameVersion` and `gameCommit`. The next set of notes covers changes since the last `gameCommit`.
- Cover gameplay changes only: rules and systems (from `docs/game-rules/` and gameplay commits in the game repo) and balance (from the game data). Skip tests, tools, telemetry and internal work. Summarize big reworks instead of listing every item.
- The user reviews the draft before it goes to translation.

## Demo builds

- The Play page always points to the most recent upload in the Drive folder Lost Faith > Build (folder id `1nWqjMt829JlNEMhNRGEwUN8CkJeH4gl6`). Pick it by upload (created) date, not by the version or date in the file name, which aren't reliable.
- Check that the file is shared as "Anyone with the link" before linking it.

## Code style

- Plain Astro, HTML and CSS. No React, Tailwind or UI frameworks unless agreed.
- The code should read like the team wrote it by hand: comments only where something isn't obvious, short and direct, no banner comments or emoji.
- Colors and fonts live in `src/styles/global.css`. Site settings (email, social links, Steam link, noindex) live in `src/site.ts`.
- Check changes with `npm run check` and `npm run build`.
- The dev server's content cache can go stale after quick edits to files in `src/content/` (sections render empty). Trust `npm run build`, and restart `npm run dev` to clear it.
