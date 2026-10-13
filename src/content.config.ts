import { defineCollection } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';

// Each entry is a folder with one file per language: en.md, sc.md, tc.md.
// Images used by the entry go in the same folder so every language can share them.
const perLanguage = (folder: string) => glob({ pattern: '**/*.{md,mdx}', base: `./src/content/${folder}` });

// "source" is the English original. Translations start as "machine" and become "reviewed" after proofreading.
const translation = z.enum(['source', 'machine', 'reviewed']).default('source');

export const TAGS = ['art', 'programming', 'design', 'team', 'audio', 'narrative', 'announcement', 'playtest', 'events', 'patch-notes'] as const;

const devlog = defineCollection({
  loader: perLanguage('devlog'),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.coerce.date(),
      summary: z.string(),
      tags: z.array(z.enum(TAGS)).default([]),
      cover: image().optional(),
      // Patch notes only: the game version, and the HolyHell commit the notes were written at.
      // The next patch notes start from this commit.
      gameVersion: z.string().optional(),
      gameCommit: z.string().optional(),
      translation,
      draft: z.boolean().default(false),
    }),
});

const characters = defineCollection({
  loader: perLanguage('lore/characters'),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      portrait: image().optional(),
      // Shown in the side panel, top to bottom.
      infobox: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
      order: z.number().default(100),
      translation,
      draft: z.boolean().default(false),
    }),
});

const locations = defineCollection({
  loader: perLanguage('lore/locations'),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      summary: z.string(),
      banner: image().optional(),
      // Dungeon group in the game data, used to list the location's areas and enemies.
      dungeonGroup: z.string().optional(),
      order: z.number().default(100),
      translation,
      draft: z.boolean().default(false),
    }),
});

// Optional written lore for an enemy page. The folder name must match the enemy's page slug.
const enemyLore = defineCollection({
  loader: perLanguage('lore/enemies'),
  schema: z.object({
    translation,
    draft: z.boolean().default(false),
  }),
});

const team = defineCollection({
  loader: file('./src/content/team/members.yaml'),
  schema: z.object({
    name: z.string(),
    role: z.object({ en: z.string(), sc: z.string().optional(), tc: z.string().optional() }),
    // File name in src/content/team/photos/
    photo: z.string().optional(),
    links: z.array(z.object({ label: z.string(), url: z.url() })).default([]),
    order: z.number().default(100),
    draft: z.boolean().default(false),
  }),
});

export const collections = { devlog, characters, locations, enemyLore, team };
