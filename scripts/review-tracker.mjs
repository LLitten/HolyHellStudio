// Keeps the "Review tracker" GitHub issue and the content files in step.
//
//   node scripts/review-tracker.mjs render          prints the issue body for the current files
//   node scripts/review-tracker.mjs apply <new> [old]  applies boxes ticked or unticked between two issue bodies
//
// The GitHub workflow (.github/workflows/review-tracker.yml) runs both. Run `render` locally to preview.
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const REPO = 'LLitten/HolyHellStudio';
const EDIT = `https://github.com/${REPO}/edit/main/`;
const LANGS = { en: 'English', tc: 'Traditional', sc: 'Simplified' };
const SECTIONS = [
  { dir: 'src/content/devlog', label: 'Dev post', post: true },
  { dir: 'src/content/lore/characters', label: 'Character' },
  { dir: 'src/content/lore/locations', label: 'Location' },
  { dir: 'src/content/lore/enemies', label: 'Enemy' },
  { dir: 'src/content/studio', label: 'Studio' },
];
// Template folders that are never published.
const SKIP = new Set(['example-post']);
// Names for entries whose files have no title of their own.
const TITLES = { about: 'About page intro' };
const enemyNames = existsSync('src/data/game/enemies.json')
  ? Object.fromEntries(JSON.parse(readFileSync('src/data/game/enemies.json', 'utf8')).map((e) => [e.slug, e.name.en]))
  : {};

const field = (text, name) => text.match(new RegExp(`^${name}:\\s*(.*)$`, 'm'))?.[1].trim().replace(/^['"]|['"]$/g, '');

function setField(file, name, value) {
  const text = readFileSync(file, 'utf8');
  const next = text.replace(new RegExp(`^${name}:.*$`, 'm'), `${name}: ${value}`);
  if (next !== text) writeFileSync(file, next);
  return next !== text;
}

function entries() {
  const list = [];
  for (const section of SECTIONS) {
    if (!existsSync(section.dir)) continue;
    for (const slug of readdirSync(section.dir).sort()) {
      if (SKIP.has(slug)) continue;
      const dir = join(section.dir, slug).replaceAll('\\', '/');
      const files = {};
      for (const lang of Object.keys(LANGS)) {
        const path = `${dir}/${lang}.md`;
        if (!existsSync(path)) continue;
        const text = readFileSync(path, 'utf8');
        files[lang] = { path, translation: field(text, 'translation') ?? 'source', draft: field(text, 'draft') === 'true' };
      }
      if (!files.en) continue;
      const en = readFileSync(files.en.path, 'utf8');
      const title = field(en, 'title') ?? field(en, 'name') ?? enemyNames[slug] ?? TITLES[slug] ?? slug;
      list.push({ ...section, slug, dir, title, files });
    }
  }
  return list;
}

// Only one Chinese version is proofread; the other is converted from it (see AGENTS.md).
function reviewable(entry) {
  const convertedFrom = entry.files.sc?.translation === 'source' ? 'tc' : 'sc';
  return Object.entries(entry.files).filter(([lang, f]) => lang !== convertedFrom && f.translation !== 'source');
}

function render() {
  const all = entries();
  const lines = [
    'Tick a box to mark a translation as proofread, or to publish a draft. The site updates a minute or two later.',
    'This list is kept up to date automatically, so there is no need to edit it by hand.',
    '',
    'Simplified Chinese is converted from Traditional (or the other way round if a page was written in Simplified), so only one of them is listed.',
    '',
  ];

  const toReview = all.flatMap((e) => reviewable(e).map(([lang, f]) => ({ e, lang, f })));
  const open = toReview.filter((r) => r.f.translation !== 'reviewed').length;
  lines.push(`## Translations (${open} to review)`, '');
  for (const { e, lang, f } of toReview) {
    const box = f.translation === 'reviewed' ? 'x' : ' ';
    lines.push(`- [${box}] ${e.label}: **${e.title}** · ${LANGS[lang]} · [edit](${EDIT}${f.path}) <!-- review:${f.path} -->`);
  }
  if (!toReview.length) lines.push('Nothing to review.');

  const drafts = all.filter((e) => Object.values(e.files).some((f) => f.draft) || e.post);
  lines.push('', '## Publishing', '', 'Ticked means the page is live. Unticking hides it again.', '');
  for (const e of drafts) {
    const live = !Object.values(e.files).some((f) => f.draft);
    const pending = reviewable(e).filter(([, f]) => f.translation === 'machine').length;
    const note = !live && pending ? ` (${pending} translation${pending > 1 ? 's' : ''} not reviewed yet)` : '';
    lines.push(`- [${live ? 'x' : ' '}] ${e.label}: **${e.title}**${note} <!-- publish:${e.dir} -->`);
  }

  lines.push(
    '',
    '## Also check',
    '',
    `These don't have a review status, so check them when the site text changes:`,
    '',
    `- Menus, buttons and other site text: [src/i18n/ui.ts](${EDIT}src/i18n/ui.ts)`,
    `- Team roles: [src/content/team/members.yaml](${EDIT}src/content/team/members.yaml)`,
  );
  return lines.join('\n') + '\n';
}

const boxes = (body) =>
  new Map([...body.matchAll(/^- \[( |x|X)\].*<!-- ((?:review|publish):\S+) -->/gm)].map(([, mark, key]) => [key, mark !== ' ']));

// Only boxes that changed between the old and new issue text are applied, so an out-of-date
// copy of the list can't undo an edit made straight in a file.
function apply(body, previous = '') {
  const before = boxes(previous);
  const changes = [];
  for (const [key, ticked] of boxes(body)) {
    if (before.get(key) === ticked) continue;
    const [kind, target] = [key.slice(0, key.indexOf(':')), key.slice(key.indexOf(':') + 1)];
    if (kind === 'review' && existsSync(target)) {
      if (setField(target, 'translation', ticked ? 'reviewed' : 'machine')) {
        changes.push(`${ticked ? 'Mark' : 'Unmark'} ${target} as reviewed`);
      }
    }
    if (kind === 'publish' && existsSync(target)) {
      let changed = false;
      for (const lang of Object.keys(LANGS)) {
        const path = `${target}/${lang}.md`;
        if (!existsSync(path)) continue;
        const text = readFileSync(path, 'utf8');
        if (field(text, 'draft') === undefined) {
          if (ticked) continue;
          // No draft line yet: add one before the closing --- of the front matter.
          writeFileSync(path, text.replace(/^(---\r?\n[\s\S]*?)(\r?\n---)/, `$1\ndraft: true$2`));
          changed = true;
        } else {
          changed = setField(path, 'draft', ticked ? 'false' : 'true') || changed;
        }
      }
      if (changed) changes.push(`${ticked ? 'Publish' : 'Unpublish'} ${target}`);
    }
  }
  return changes;
}

const [mode, arg, previous] = process.argv.slice(2);
if (mode === 'render') {
  process.stdout.write(render());
} else if (mode === 'apply') {
  const changes = apply(readFileSync(arg, 'utf8'), previous ? readFileSync(previous, 'utf8') : '');
  process.stdout.write(changes.join('\n') + (changes.length ? '\n' : ''));
} else {
  console.error('Usage: node scripts/review-tracker.mjs render | apply <issue-body-file>');
  process.exit(1);
}
