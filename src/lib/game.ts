// Game data written by `npm run sync-data`. Don't edit the JSON by hand; re-run the sync instead.
import type { ImageMetadata } from 'astro';
import type { Lang } from '../i18n/ui';
import cardsJson from '../data/game/cards.json';
import itemsJson from '../data/game/items.json';
import enemiesJson from '../data/game/enemies.json';
import locationsJson from '../data/game/locations.json';
import termsJson from '../data/game/terms.json';
import metaJson from '../data/game/meta.json';
import glossaryJson from '../data/game/glossary.json';

export type Text = Record<Lang, string>;

export interface Card {
  id: string;
  art: string | null;
  inherent: boolean;
  factions: string[];
  gods: string[];
  durability: number | null;
  angelGain: number;
  demonGain: number;
  rarity: number;
  cost: number;
  actionTypes: string[];
  name: Text;
  description: Text;
}

export type ItemSource =
  | { type: 'drop'; enemy: string }
  | { type: 'shop' }
  | { type: 'event' }
  | { type: 'upgrade'; from: string }
  | { type: 'merge'; from: string };

export interface Item {
  id: string;
  kind: 'equipment' | 'material';
  subType: string;
  icon: string | null;
  tint: string | null;
  rarity: number;
  price: { min: number; max: number } | null;
  stats: { attack: number; hp: number; defense: number } | null;
  sources: ItemSource[];
  name: Text;
  description: Text;
  lore: Text;
  areas: string[];
  keywords: string[];
}

export interface EnemySkill {
  id: string;
  trigger: 'turn' | 'combatStart' | 'turnStart' | 'death';
  name: Text;
  detail: Text;
}

export interface EnemyVariant {
  id: string;
  rank: 'Minion' | 'Elite' | 'Boss';
  hp: number;
  attack: number;
  defense: number;
  dungeons: string[];
  summonedBy: string | null;
  skills: EnemySkill[];
  drops: { item: string; chance: number; min: number; max: number }[];
}

export interface Enemy {
  slug: string;
  art: string | null;
  name: Text;
  variants: EnemyVariant[];
}

export interface Location {
  group: string;
  name: Text;
  dungeons: { id: string; name: Text; description: Text }[];
}

export interface GlossaryEntry {
  id: string;
  kind: 'buff' | 'debuff' | 'keyword';
  group: string;
  icon: string | null;
  tint: string | null;
  name: Text;
  tags: Text | null;
  description: Text;
}

export const cards = cardsJson as Card[];
export const items = itemsJson as Item[];
export const enemies = enemiesJson as Enemy[];
export const locations = locationsJson as Location[];
export const glossary = glossaryJson as GlossaryEntry[];
export const terms = termsJson as Record<'factions' | 'gods' | 'actionTypes', Record<string, Text>>;

export const itemById = new Map(items.map((i) => [i.id, i]));

// Filter values for an item (the item filters and the data attributes on item tiles).
export const itemSources = (i: Item) => [...new Set(i.sources.map((s) => s.type))];
export const enemyBySlug = new Map(enemies.map((e) => [e.slug, e]));
export const enemySlugById = new Map(Object.entries(metaJson.enemySlugById));
export const dungeonById = new Map(locations.flatMap((l) => l.dungeons.map((d) => [d.id, d])));

export const enemyById = (id: string) => enemyBySlug.get(enemySlugById.get(id) ?? '');

// Enemies grouped by the area (dungeon group) they're found in. An enemy found in two areas is listed in both.
const groupOfDungeon = new Map(locations.flatMap((l) => l.dungeons.map((d) => [d.id, l.group])));
const areaGroups = (e: Enemy) => new Set(e.variants.flatMap((v) => v.dungeons.map((d) => groupOfDungeon.get(d))));
export const enemyAreas = locations.map((l) => ({
  slug: l.name.en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
  name: l.name,
  enemies: enemies.filter((e) => areaGroups(e).has(l.group)),
}));

export const GOD_ORDER = ['Intereon', 'Florentis', 'Evinor', 'Oculyth', 'Hedalis', 'Vortherect'];

const art = import.meta.glob<{ default: ImageMetadata }>('../assets/game/**/*.{png,jpg}', { eager: true });

export function gameArt(kind: 'cards' | 'items' | 'enemies' | 'glossary', file: string | null) {
  return file ? art[`../assets/game/${kind}/${file}`]?.default : undefined;
}

export const term = (group: keyof typeof terms, key: string, lang: Lang) => terms[group][key]?.[lang] ?? key;
