// Copies the game's data tables and art from a local clone of the HolyHell repo
// and writes the parts the website shows into src/data/game and src/assets/game.
// It never writes to the game repo.
//
//   npm run sync-data                       (expects ../HolyHell next to this repo)
//   HOLYHELL_PATH=/path/to/HolyHell npm run sync-data
//
// Only content reachable from Windchime Village (dungeon group 1) is included.
// Widen IN_SCOPE_GROUPS when later regions are ready.

import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { parse } from 'csv-parse/sync';

const IN_SCOPE_GROUPS = ['1'];
// The Stage 1 tutorial fight lives in Battle.csv rather than a dungeon's enemy pool.
const EXTRA_BATTLES = ['tut_battle'];
// Debug entries borrow real art, so they're caught by name instead (XddHit, xddDummyNo.1, ...).
const isDebug = (name) => /^xdd/i.test(name);
// The shops aren't finished yet. Turn this back on to list them under "How to get" (with prices).
const INCLUDE_SHOP = false;

const GAME = resolve(process.env.HOLYHELL_PATH || '../HolyHell');
const RES = join(GAME, 'HolyHell/Assets/Res_Local/Global');
const TABLES = join(RES, 'Tables');
const OUT_DATA = resolve('src/data/game');
const OUT_ART = resolve('src/assets/game');

const LANGS = { en: 'En', sc: 'Sc', tc: 'Zh' };

if (!existsSync(TABLES)) {
  console.error(`Can't find the game tables at ${TABLES}`);
  console.error('Set HOLYHELL_PATH to your local clone of the HolyHell repo.');
  process.exit(1);
}

function table(name) {
  const text = readFileSync(join(TABLES, `${name}.csv`), 'utf8');
  return parse(text, { columns: true, bom: true, skip_empty_lines: true, relax_column_count: true })
    .map((row) => Object.fromEntries(Object.entries(row).map(([k, v]) => [k.trim(), (v ?? '').trim()])));
}

const split = (value, sep = /[,|]/) => (value || '').split(sep).map((s) => s.trim()).filter(Boolean);
const num = (value) => (value === '' || value == null ? 0 : Number(value));

// ---------------------------------------------------------------------------
// Localization

const loc = {};
for (const [lang, file] of Object.entries(LANGS)) {
  loc[lang] = new Map();
  for (const row of table(`Localization/${file}`)) {
    if (row.ID && row.Text) loc[lang].set(row.ID, row.Text);
  }
}

const text = (lang, key, fallback = '') => loc[lang].get(key) ?? fallback;
const allLangs = (fn) => Object.fromEntries(Object.keys(LANGS).map((lang) => [lang, fn(lang)]));
const localized = (key, fallback) => allLangs((lang) => text(lang, key, fallback));

// Mirrors LocText.Term: action types, gods, factions, then keywords.
function term(lang, raw) {
  return raw
    .split(/[|;]/)
    .map((part) => {
      const word = part.trim();
      if (!/^\p{L}/u.test(word)) return part;
      for (const prefix of ['Term_ActionType_', 'Term_God_', 'Term_Faction_', 'Keyword_']) {
        if (loc[lang].has(prefix + word)) return loc[lang].get(prefix + word);
      }
      return part;
    })
    .join('/');
}

// ---------------------------------------------------------------------------
// Description templates. Ported from BattleTextFormatter so the site reads the
// same as the game. Output is HTML: keywords and icons become spans.

const keywordDefs = new Map(table('Keyword').map((k) => [k.KeywordID, k.Definition]));

const escape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const stripRichText = (s) => s.replace(/<\/?[a-z][^>]*>/gi, '');

// Screen-reader names for the icons in card text, in the game's own words.
const ICON_LABEL_IDS = {
  ameter: 'Keyword_Ameter',
  dmeter: 'Keyword_Dmeter',
  hp: 'Term_Stat_HP',
  durability: 'UI_DeckBuild_Durability',
};
const ICON_LABELS = Object.fromEntries(
  Object.entries(ICON_LABEL_IDS).map(([name, id]) => [name, allLangs((lang) => text(lang, id, name))]),
);

const icon = (lang, name) =>
  ICON_LABELS[name] ? `<span class="icon icon-${name}" role="img" aria-label="${ICON_LABELS[name][lang]}"></span>` : null;

const keywordName = (lang, word) => text(lang, `Keyword_${word[0].toUpperCase() + word.slice(1)}`, word);

// Keyword definitions carry tokens of their own; a title attribute needs them as plain words.
const plainText = (lang, s) =>
  stripRichText(s)
    .replace(/\{keyword:(\w+)\}/gi, (_, word) => keywordName(lang, word))
    .replace(/\{icon:(\w+)\}/gi, (match, name) => ICON_LABELS[name.toLowerCase()]?.[lang] ?? match);

function keyword(lang, word) {
  const id = word[0].toUpperCase() + word.slice(1);
  const def = text(lang, `KeywordEff_${id}`, keywordDefs.get(id) || '');
  const title = def ? ` title="${escape(plainText(lang, def))}"` : '';
  return `<span class="kw"${title}>${escape(keywordName(lang, word))}</span>`;
}

const OPERATORS = { '>=': '≥', '<=': '≤', '!=': '≠', '==': '=' };

function namedKeyIndex(effectType, key) {
  const k = key.toLowerCase();
  if (effectType === 'Branch') {
    if (k === 'branchid') return 0;
    const i = namedKeyIndex('ApplyBuff', key);
    return i == null ? null : i + 1;
  }
  if (effectType === 'ApplyBuff') {
    if (k === 'target') return 0;
    const i = namedKeyIndex('PersistBuff', key);
    return i == null ? null : i + 1;
  }
  if (['SelfBuff', 'SingleBuff', 'AOEBuff', 'PersistBuff'].includes(effectType)) {
    return { buffid: 0, param: 1, parameter: 1, stack: 2, stackcount: 2, duration: 3 }[k] ?? null;
  }
  return null;
}

// `slots` holds { type, value, req } for effect slots 1-5 (cards only).
function formatText(lang, template, slots = []) {
  if (!template) return '';
  let out = escape(stripRichText(template));
  const slot = (n) => slots[n - 1] || {};

  out = out.replace(/\{effect(\d+)\s*[,:]\s*([^}]+)\}/gi, (match, n, key) => {
    const { type, value } = slot(Number(n));
    if (!value) return match;
    const parts = value.split(',');
    const index = /^\d+$/.test(key.trim()) ? Number(key) : namedKeyIndex(type, key.trim());
    if (index == null || index >= parts.length) return match;
    return escape(term(lang, parts[index].trim()));
  });

  out = out.replace(/\{req(\d+)\s*[,:]\s*([^}]+)\}/gi, (match, n, rawVar) => {
    const req = slot(Number(n)).req;
    if (!req) return match;
    let name = rawVar.trim();
    const lower = name.toLowerCase();
    if (lower === 'hp') name = 'SelfHP';
    const prefix =
      lower === 'hp' ? icon(lang, 'hp') :
      lower === 'durability' ? icon(lang, 'durability') :
      lower === 'handsize' ? escape(text(lang, 'UI_Req_Handsize', '手牌')) : '';
    for (const line of req.split('\n')) {
      const m = line.match(/(\w+)\s*(>=|<=|==|!=|>|<|=)\s*(\S+)/);
      if (!m || m[1].toLowerCase() !== name.toLowerCase()) continue;
      return prefix + escape(m[2] === '=' ? m[3] : (OPERATORS[m[2]] ?? m[2]) + m[3]);
    }
    return match;
  });

  out = out.replace(/\{icon:(type|ameter|dmeter|hp|durability)\}/gi, (match, name) => icon(lang, name.toLowerCase()) ?? match);
  out = out.replace(/\{keyword:(\w+)\}/gi, (_, word) => keyword(lang, word));

  // Legacy tokens still used by a few rows.
  out = out.replace(/\{Value:EffectVal(\d+),(\d+)\}/g, (match, n, i) => {
    const parts = (slot(Number(n)).value || '').split(',');
    return parts[i] != null ? escape(term(lang, parts[i].trim())) : match;
  });
  out = out.replace(/\{Value:EffectVal(\d)\}/g, (_, n) => escape(slot(Number(n)).value || ''));

  return out.replace(/\r?\n/g, '<br>');
}

const formatted = (key, fallback, slots) => allLangs((lang) => formatText(lang, text(lang, key, fallback), slots));

// ---------------------------------------------------------------------------
// Scope: dungeons, enemies, items and cards reachable from Windchime Village

const dungeons = table('Dungeon').filter(
  (d) => IN_SCOPE_GROUPS.includes(d.DungeonGroup) && d.DevOnly !== '1' && !d.Id.startsWith('Test'),
);
const dungeonIds = new Set(dungeons.map((d) => d.Id));

const enemyRows = new Map(table('Enemy').map((e) => [e.ID, e]));
const skillRows = new Map(table('MonsterSkill').map((s) => [s.ID, s]));
const behaviorRows = new Map(table('EnemyBehavior').map((b) => [b.ID, b]));

function skillsOf(enemy) {
  const ids = [];
  const behavior = behaviorRows.get(enemy.BehaviorID);
  if (behavior) {
    for (let i = 1; i <= 6; i++) {
      const [id, weight] = split(behavior[`Skill${i}`], ',');
      if (id) ids.push({ id, trigger: 'turn', weight: num(weight) });
    }
  }
  for (const [column, trigger] of [['OnCombatStart', 'combatStart'], ['OnTurnStart', 'turnStart'], ['OnDeath', 'death']]) {
    for (const id of split(enemy[column], /[,\n]/)) ids.push({ id, trigger });
  }
  return ids.filter((s) => skillRows.has(s.id));
}

// enemy id -> { rank, dungeons }
const enemyScope = new Map();
function addEnemy(id, dungeonId, pool) {
  if (!enemyRows.has(id) || isDebug(enemyRows.get(id).DisplayName)) return;
  const entry = enemyScope.get(id) || { pools: new Set(), dungeons: new Set() };
  if (pool) entry.pools.add(pool);
  if (dungeonId) entry.dungeons.add(dungeonId);
  enemyScope.set(id, entry);
}

for (const d of dungeons) {
  for (const id of split(d.NormalEnemyPool)) addEnemy(id, d.Id, 'Minion');
  for (const id of split(d.EliteEnemyPool)) addEnemy(id, d.Id, 'Elite');
  for (const id of split(d.BossEnemyPool)) addEnemy(id, d.Id, 'Boss');
}
for (const battle of table('Battle').filter((b) => EXTRA_BATTLES.includes(b.Id))) {
  for (const wave of ['Wave1', 'Wave2', 'Wave3']) {
    for (const id of split(battle[wave])) addEnemy(id, dungeons[0]?.Id, 'Minion');
  }
}

// Bosses summon reinforcements; those count as reachable too.
const summonedBy = new Map();
for (let changed = true; changed; ) {
  changed = false;
  for (const [id, entry] of [...enemyScope]) {
    for (const { id: skillId } of skillsOf(enemyRows.get(id))) {
      const skill = skillRows.get(skillId);
      for (let i = 1; i <= 3; i++) {
        if (skill[`Effect${i}`] !== 'Summon') continue;
        const [summonId] = split(skill[`EffectAtr${i}`], ',');
        if (!summonId || !enemyRows.has(summonId)) continue;
        summonedBy.set(summonId, id);
        if (!enemyScope.has(summonId)) changed = true;
        for (const dungeonId of entry.dungeons) addEnemy(summonId, dungeonId, 'Minion');
      }
    }
  }
}

const itemRows = new Map(table('Item').map((i) => [i.ID, i]));
const GOLD = '500001';
// item id -> list of { type, ... }
const sources = new Map();
function addSource(itemId, source) {
  if (itemId === GOLD || !itemRows.has(itemId)) return false;
  const list = sources.get(itemId) || [];
  const key = JSON.stringify(source);
  if (list.some((s) => JSON.stringify(s) === key)) return false;
  list.push(source);
  sources.set(itemId, list);
  return true;
}

const drops = table('MonsterDrop').filter((d) => enemyScope.has(d.EnemyID) && d.ItemID !== GOLD);
for (const d of drops) addSource(d.ItemID, { type: 'drop', enemy: d.EnemyID });

if (INCLUDE_SHOP) {
  for (const row of table('ShopGoodsPool_SoulPack')) addSource(row.ItemID, { type: 'shop' });
  for (const row of table('ShopGoodsPool_Accessory')) {
    const groups = split(row.DungeonGroup);
    const inGroup = groups.length === 0 || groups.some((g) => IN_SCOPE_GROUPS.includes(g));
    const weight = Math.max(...IN_SCOPE_GROUPS.map((g) => num(row[`Group${g}Weight`])));
    if (inGroup && weight > 0) addSource(row.ItemID, { type: 'shop' });
  }
}

const events = table('DungeonEvent_Main').filter(
  (e) => e.Is_Global.toUpperCase() === 'TRUE' || split(e.Dungeon_Bound).some((id) => dungeonIds.has(id)),
);
const eventIds = new Set(events.map((e) => e.Event_ID));
for (const outcome of table('DungeonEvent_Outcome').filter((o) => eventIds.has(o.Event_ID))) {
  for (let i = 1; i <= 3; i++) {
    if (outcome[`Effect_Action${i}`] !== 'GainItem') continue;
    for (const line of outcome[`Effect_Value${i}`].split('\n')) {
      const [itemId] = split(line, ',');
      if (itemId) addSource(itemId, { type: 'event' });
    }
  }
}

// Five fragments of a god merge into that god's soul pack.
const FRAGMENT_TO_PACK = {
  500011: '500005', 500012: '500006', 500013: '500007',
  500014: '500008', 500015: '500009', 500016: '500010',
};
const upgrades = table('ItemUpgrade');
for (let changed = true; changed; ) {
  changed = false;
  for (const [fragment, pack] of Object.entries(FRAGMENT_TO_PACK)) {
    if (sources.has(fragment) && addSource(pack, { type: 'merge', from: fragment })) changed = true;
  }
  for (const u of upgrades) {
    if (sources.has(u.BaseItem) && addSource(u.UpgradeResult, { type: 'upgrade', from: u.BaseItem })) changed = true;
  }
}

const PURE_PACK = '500002';
const ANGEL_PACK = '500003';
const DEMON_PACK = '500004';
const GOD_PACKS = {
  Intereon: '500005', Florentis: '500006', Evinor: '500007',
  Oculyth: '500008', Hedalis: '500009', Vortherect: '500010',
};

// ---------------------------------------------------------------------------
// Art

rmSync(OUT_ART, { recursive: true, force: true });
const missingArt = [];
function copyArt(kind, from, name) {
  const src = join(RES, from);
  if (!existsSync(src)) {
    missingArt.push(`${kind}/${name}`);
    return null;
  }
  mkdirSync(join(OUT_ART, kind), { recursive: true });
  copyFileSync(src, join(OUT_ART, kind, name));
  return name;
}

// The title screen art is the home page's hero image.
const TITLE_SCREEN = join(GAME, 'HolyHell/Assets/Arts/UI/MainMenu/TitleScreen.png');
if (existsSync(TITLE_SCREEN)) {
  mkdirSync(join(OUT_ART, 'home'), { recursive: true });
  copyFileSync(TITLE_SCREEN, join(OUT_ART, 'home', 'title-screen.png'));
} else {
  missingArt.push('home/title-screen.png');
}

// ---------------------------------------------------------------------------
// Cards

const cards = [];
for (const c of table('Card')) {
  if (!c.CardDisplayArt || isDebug(c.DisplayName)) continue; // test cards have no art
  const inherent = num(c.Durability) < 0;
  const gods = split(c.Godhood).filter((g) => g !== 'None');
  const factions = split(c.Faction);

  let obtainable = false;
  if (!inherent && c.ExcludeFromPool !== '1') {
    const packs = [];
    if (gods.length) packs.push(PURE_PACK, ...gods.map((g) => GOD_PACKS[g]));
    if (factions.includes('Angel')) packs.push(ANGEL_PACK);
    if (factions.includes('Demon')) packs.push(DEMON_PACK);
    obtainable = packs.some((p) => sources.has(p));
  }
  if (!inherent && !obtainable) continue;

  const slots = [1, 2, 3, 4, 5].map((n) => ({ type: c[`Effect${n}`], value: c[`EffectAtr${n}`], req: c[`EffectReq${n}`] }));
  cards.push({
    id: c.ID,
    art: copyArt('cards', `2D/Card/${c.CardDisplayArt}.jpg`, `${c.CardDisplayArt}.jpg`),
    inherent,
    factions,
    gods,
    durability: inherent ? null : num(c.Durability),
    angelGain: num(c.AvalueInc),
    demonGain: num(c.DvalueInc),
    rarity: num(c.Rarity),
    cost: num(c.ActionCost),
    actionTypes: split(c.ActionType),
    name: localized(`Card_${c.ID}`, c.DisplayName),
    description: formatted(`CardEff_${c.ID}`, c.Description, slots),
  });
}

// ---------------------------------------------------------------------------
// Items

const effectRows = new Map(table('EquipmentEffect').map((e) => [e.ID, e]));
const items = [];
for (const [id, list] of sources) {
  const row = itemRows.get(id);
  const kind = row.Category === 'Equipment' ? 'equipment' : ['Material', 'Consumable', 'RareMaterial'].includes(row.Category) ? 'material' : null;
  if (!kind) continue;

  let stats = null;
  if (kind === 'equipment') {
    stats = { attack: 0, hp: 0, defense: 0 };
    for (const effectId of split(row.AccessID)) {
      const e = effectRows.get(effectId);
      if (!e) continue;
      stats.attack += num(e.AtkPercent);
      stats.hp += num(e.MaxHP);
      stats.defense += num(e.Def);
    }
  }

  const [min, max] = split(row.BuyPrice, ',').map(Number);
  const inShop = list.some((s) => s.type === 'shop');

  items.push({
    id,
    kind,
    subType: row.SubType || row.Category,
    icon: row.SpriteID ? copyArt('items', `UI/Items/${row.SpriteID}.png`, `${row.SpriteID}.png`) : null,
    tint: /^#[0-9a-f]{6}$/i.test(row.SpriteColor) ? row.SpriteColor : null,
    rarity: num(row.Rarity),
    price: inShop && min ? { min, max: max || min } : null,
    stats,
    sources: list,
    name: localized(`Item_${id}`, row.DisplayName),
    description: formatted(`ItemEff_${id}`, row.EffDes),
    lore: formatted(`ItemDes_${id}`, row.LoreDes),
  });
}

// ---------------------------------------------------------------------------
// Enemies, grouped into one page per name (tiers share a name and art).

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const enemyPages = new Map();
for (const [id, scope] of enemyScope) {
  const e = enemyRows.get(id);
  const slug = slugify(e.DisplayName) || id;
  const page = enemyPages.get(slug) || {
    slug,
    art: null,
    name: localized(`Enemy_${id}`, e.DisplayName),
    variants: [],
  };
  const artKey = e.Art || id;
  page.art ??= copyArt('enemies', `2D/Enemy/${artKey}.png`, `${artKey}.png`);

  const rank = e.Rank || (scope.pools.has('Boss') ? 'Boss' : scope.pools.has('Elite') ? 'Elite' : 'Minion');
  page.variants.push({
    id,
    rank: rank[0].toUpperCase() + rank.slice(1).toLowerCase(),
    hp: num(e.HP),
    attack: num(e.BaseAtk),
    defense: num(e.Def),
    dungeons: [...scope.dungeons],
    summonedBy: summonedBy.get(id) ?? null,
    skills: skillsOf(e).map((s) => {
      const skill = skillRows.get(s.id);
      return {
        id: s.id,
        trigger: s.trigger,
        name: localized(`Skill_${s.id}`, skill.DisplayName),
        detail: allLangs((lang) => formatText(lang, text(lang, `SkillDetail_${s.id}`, skill.SkillDetail))),
      };
    }),
    drops: drops
      .filter((d) => d.EnemyID === id)
      .map((d) => ({ item: d.ItemID, chance: num(d.Chance), min: num(d.AmountMin), max: num(d.AmountMax) })),
  });
  enemyPages.set(slug, page);
}

// Item sources point at enemy ids; the site links to the enemy's page.
const enemySlugById = Object.fromEntries([...enemyPages.values()].flatMap((p) => p.variants.map((v) => [v.id, p.slug])));

// ---------------------------------------------------------------------------
// Locations and labels

const locations = IN_SCOPE_GROUPS.map((group) => ({
  group,
  name: localized(`DungeonGroup_${group}`, ''),
  dungeons: dungeons
    .filter((d) => d.DungeonGroup === group)
    .map((d) => ({
      id: d.Id,
      name: localized(`Dungeon_${d.Id}`, d.DisplayName),
      description: localized(`Dungeon_${d.Id}_Des`, ''),
    })),
}));

// Site labels the game already has text for, so the site uses the game's wording.
// Site key -> localization id. "{0}" placeholders are dropped, except in rarity.value.
const LABELS = {
  'card.cost': 'UI_DeckBuild_Cost',
  'card.durability': 'UI_DeckBuild_Durability',
  'card.angel': 'Keyword_Ameter',
  'card.demon': 'Keyword_Dmeter',
  'card.faction': 'UI_DeckBuild_Faction',
  'card.god': 'UI_DeckBuild_God',
  'card.type': 'UI_DeckBuild_ActionType',
  'card.inherent': 'UI_Battle_inherent',
  'card.inherentGroup': 'UI_DeckBuild_BasicSlots',
  'card.noGod': 'Term_Faction_Neutral',
  'rarity': 'UI_DeckBuild_Rarity',
  'rarity.value': 'UI_Item_RarityLevel',
  'item.type': 'UI_Inventory_Sort_Type',
  'item.attack': 'UI_EntityDetail_Atk',
  'item.hp': 'UI_Item_StatMaxHP',
  'item.defense': 'UI_EntityDetail_Def',
  'subtype.Offense': 'UI_Inventory_SubType_Offense',
  'subtype.Defense': 'UI_Inventory_SubType_Defense',
  'subtype.Other': 'UI_Inventory_SubType_Other',
  'subtype.CardPack': 'UI_Inventory_SubType_CardPack',
  'subtype.SoulFragment': 'UI_Inventory_SubType_SoulFragment',
  'subtype.Material': 'UI_Inventory_SubType_Material',
  'subtype.RareMaterial': 'UI_Inventory_SubType_RareMaterial',
  'enemy.hp': 'Term_Stat_HP',
  'enemy.attack': 'UI_EntityDetail_Atk',
  'enemy.defense': 'UI_EntityDetail_Def',
  'enemy.rank.Elite': 'UI_Map_NodeElite',
  'enemy.rank.Boss': 'UI_Map_NodeBoss',
  'lore.equipment': 'Term_ItemCategory_Equipment',
  'lore.materials': 'UI_Item_Materials',
};

const missingLabels = [];
const labels = allLangs((lang) =>
  Object.fromEntries(
    Object.entries(LABELS).map(([key, id]) => {
      const value = loc[lang].get(id) ?? loc.en.get(id);
      if (!value) missingLabels.push(`${lang} ${id}`);
      const label =
        key === 'rarity.value' ? (value ?? '{0}').replace('{0}', '{n}') : (value ?? '').replace(/\{\d\}/g, '').trim();
      return [key, label];
    }),
  ),
);

const terms = {
  factions: Object.fromEntries(['Neutral', 'Angel', 'Demon'].map((f) => [f, localized(`Term_Faction_${f}`, f)])),
  gods: Object.fromEntries(Object.keys(GOD_PACKS).map((g) => [g, localized(`Term_God_${g}`, g)])),
  actionTypes: Object.fromEntries(
    [...new Set(cards.flatMap((c) => c.actionTypes))].map((t) => [t, localized(`Term_ActionType_${t}`, t)]),
  ),
};

// ---------------------------------------------------------------------------
// Write

mkdirSync(OUT_DATA, { recursive: true });
const write = (name, data) => writeFileSync(join(OUT_DATA, `${name}.json`), JSON.stringify(data, null, 2) + '\n');

write('cards', cards);
write('items', items.sort((a, b) => a.rarity - b.rarity || a.id.localeCompare(b.id)));
write('enemies', [...enemyPages.values()]);
write('locations', locations);
write('terms', terms);
write('meta', { enemySlugById });
write('labels', labels);

const equipment = items.filter((i) => i.kind === 'equipment');
const materials = items.filter((i) => i.kind === 'material');
console.log(`Synced from ${GAME}`);
console.log(`  ${cards.length} cards (${cards.filter((c) => c.inherent).length} inherent)`);
console.log(`  ${equipment.length} equipment, ${materials.length} materials`);
console.log(`  ${enemyPages.size} enemy pages from ${enemyScope.size} enemies`);
const noIcon = items.filter((i) => !i.icon).map((i) => `${i.id} ${i.name.en}`);
if (noIcon.length) console.log(`  ${noIcon.length} items have no icon yet:\n    ${noIcon.join('\n    ')}`);
if (missingArt.length) console.log(`  Missing art files:\n    ${missingArt.join('\n    ')}`);
if (missingLabels.length) console.log(`  Missing labels:\n    ${missingLabels.join('\n    ')}`);

// Any {token} left in the output is one the formatter above doesn't know yet (the game added a
// new kind). It would show up on the site as raw text, so say where.
const leftovers = new Map();
for (const [file, data] of [['cards', cards], ['items', items], ['enemies', [...enemyPages.values()]]]) {
  for (const match of JSON.stringify(data).matchAll(/\{[A-Za-z]+\d*[:,][^}"]*\}/g)) {
    leftovers.set(match[0], `${file}.json`);
  }
}
if (leftovers.size) {
  console.log('  Unrecognized text tokens (these show up as raw text on the site):');
  for (const [token, file] of leftovers) console.log(`    ${token} in ${file}`);
}
