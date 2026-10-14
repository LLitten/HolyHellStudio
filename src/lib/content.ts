import { getCollection, type CollectionEntry } from 'astro:content';
import { defaultLang, type Lang } from '../i18n/ui';
import { TAGS } from '../content.config';

type PerLanguage = 'devlog' | 'characters' | 'locations' | 'enemyLore' | 'studio';

export type Localized<C extends PerLanguage> = CollectionEntry<C> & {
  slug: string;
  // True when the requested language is missing and the English version is shown instead.
  isFallback: boolean;
};

// Drafts show up in `npm run dev` but never in the built site.
const showDrafts = import.meta.env.DEV;

// Picks each entry's version in `lang`, falling back to English.
export async function getLocalized<C extends PerLanguage>(collection: C, lang: Lang): Promise<Localized<C>[]> {
  const entries = (await getCollection(collection)) as CollectionEntry<C>[];
  const bySlug = new Map<string, Partial<Record<string, CollectionEntry<C>>>>();

  for (const entry of entries) {
    if (!showDrafts && (entry.data as { draft?: boolean }).draft) continue;
    const cut = entry.id.lastIndexOf('/');
    const slug = entry.id.slice(0, cut);
    const entryLang = entry.id.slice(cut + 1);
    bySlug.set(slug, { ...bySlug.get(slug), [entryLang]: entry });
  }

  const result: Localized<C>[] = [];
  for (const [slug, versions] of bySlug) {
    const entry = versions[lang] ?? versions[defaultLang];
    if (entry) result.push({ ...entry, slug, isFallback: !versions[lang] });
  }
  return result;
}

export async function getPosts(lang: Lang) {
  const posts = await getLocalized('devlog', lang);
  return posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export const POSTS_PER_PAGE = 20;

// Tags used by at least one of these posts, in the order they're defined.
export function usedTags(posts: Localized<'devlog'>[]) {
  return TAGS.filter((tag) => posts.some((p) => p.data.tags.includes(tag)));
}
