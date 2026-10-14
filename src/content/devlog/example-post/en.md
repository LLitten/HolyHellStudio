---
title: Example Post
date: 2026-10-13
summary: A template to copy when writing a new dev post. Drafts only show up in local preview.
tags: [team, announcement]
# cover: ./cover.jpg
# coverAlt: What the cover image shows
translation: source
draft: true
---

Copy this folder, rename it (the folder name becomes the URL, e.g. `/devlog/example-post/`), and replace this text.

## Images

Put images in this folder and link them with a relative path:

```md
![Combat screen with three enemies](./combat.png)
```

## Clips and GIFs

Convert GIFs to MP4 first (they're a fraction of the size). Rename the file to `en.mdx`, then:

```mdx
import clip from './clip.mp4';

<video src={clip} autoplay loop muted playsinline></video>
```

## YouTube

```html
<iframe src="https://www.youtube-nocookie.com/embed/VIDEO_ID" title="Trailer" allowfullscreen></iframe>
```

## Credit

If a post needs an author line, add it as a heading at the top of the post.
