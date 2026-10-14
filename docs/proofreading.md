# Proofreading Guide

Everything is done on GitHub in your browser. Your changes go live on holyhellstudio.net about a minute after you save.

## Steps

1. Click a link in the list below. It opens the file in GitHub's editor.
2. Fix the text. Only change the words, not the layout around them.
3. Near the top, change `translation: machine` to `translation: reviewed`. This removes the "machine translated" note on the site.
4. Click **Commit changes** (green button), then **Commit changes** again.

Use the **Preview** tab in the editor to see how the text will look.

## Please don't change

- The `---` lines at the top
- The words before a colon, like `title:` or `date:` (change the text after the colon, not the word before it)
- Anything inside `( )` after an image, like `![...](./image-2.jpg)`

## To proofread

If a file already says `translation: reviewed`, it's been done and you can skip it.

### Traditional Chinese

Simplified Chinese is converted from Traditional, so only Traditional needs checking. (If something was written in Simplified first, it's the other way round.)

- [Volva the Torrent (Traditional)](https://github.com/LLitten/HolyHellStudio/edit/main/src/content/lore/enemies/volva-the-torrent/tc.md)
- [Windchime Village (Traditional)](https://github.com/LLitten/HolyHellStudio/edit/main/src/content/lore/locations/windchime-village/tc.md)
- [About page intro (Traditional)](https://github.com/LLitten/HolyHellStudio/edit/main/src/content/studio/about/tc.md)
- [Menus, buttons and other site text](https://github.com/LLitten/HolyHellStudio/edit/main/src/i18n/ui.ts). Traditional is the block that starts with `tc: {`. Only change the text in quotes on the right side of each line.
- [Team roles](https://github.com/LLitten/HolyHellStudio/edit/main/src/content/team/members.yaml). The `tc:` lines under each `role:`.

### English (translated from the Chinese Threads posts)

- [Dev post: Rethinking How Cards Are Drawn](https://github.com/LLitten/HolyHellStudio/edit/main/src/content/devlog/2026-09-card-draw-rework/en.md)
- [Dev post: Our First Finished Background and NPC Portrait](https://github.com/LLitten/HolyHellStudio/edit/main/src/content/devlog/2026-09-first-background-and-portrait/en.md)
- [Dev post: Power Is Borrowed](https://github.com/LLitten/HolyHellStudio/edit/main/src/content/devlog/2026-09-power-is-borrowed/en.md)
- [Dev post: Our First Outside Playtest](https://github.com/LLitten/HolyHellStudio/edit/main/src/content/devlog/2026-10-first-playtest/en.md)
- [Dev post: Why We Make Games](https://github.com/LLitten/HolyHellStudio/edit/main/src/content/devlog/2026-10-why-we-make-games/en.md)

Dev posts aren't on the live site yet, so check those with the **Preview** tab.

Card, item and enemy text comes from the game itself, so fixes for those go in the game's localization sheet instead.
