import { ui, languages, defaultLang, type Lang, type UIKey } from './ui';
import gameLabels from '../data/game/labels.json';

export const langs = Object.keys(languages) as Lang[];

// Every page lives in src/pages/[...lang]/, where `lang` is undefined for English.
export function langPaths() {
  return langs.map((lang) => ({ params: { lang: lang === defaultLang ? undefined : lang } }));
}

export function getLang(param: string | undefined): Lang {
  return param && param in languages ? (param as Lang) : defaultLang;
}

export function useTranslations(lang: Lang) {
  return function t(key: UIKey, vars: Record<string, string | number> = {}) {
    const table = { ...ui[lang], ...gameLabels[lang] } as Record<string, string>;
    let text = table[key] ?? (ui[defaultLang] as Record<string, string>)[key];
    for (const [name, value] of Object.entries(vars)) text = text.replace(`{${name}}`, String(value));
    return text;
  };
}

const base = import.meta.env.BASE_URL.replace(/\/$/, '');

// Builds a link to a page in the given language: localePath('tc', 'lore/cards') -> /HolyHellStudio/tc/lore/cards/
export function localePath(lang: Lang, path = '') {
  const clean = path.replace(/^\/|\/$/g, '');
  const parts = [base, lang === defaultLang ? '' : lang, clean].filter(Boolean);
  return `/${parts.join('/').replace(/^\//, '')}/`.replace(/\/+/g, '/');
}

// The same page in another language, used by the language picker and hreflang links.
export function switchLang(pathname: string, lang: Lang) {
  let path = pathname.startsWith(base) ? pathname.slice(base.length) : pathname;
  const first = path.split('/').filter(Boolean)[0];
  if (first && first in languages) path = path.replace(`/${first}`, '');
  return localePath(lang, path);
}

// Plain asset URL under the site base, for files in public/.
export function assetPath(path: string) {
  return `${base}/${path.replace(/^\//, '')}`;
}

export function formatDate(date: Date, lang: Lang) {
  return new Intl.DateTimeFormat(lang === 'en' ? 'en-US' : lang === 'sc' ? 'zh-CN' : 'zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}
