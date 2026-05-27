import { locales, defaultLocale, Locale } from './routing';
import 'server-only';

const dictionaries: Record<Locale, () => Promise<Record<string, any>>> = {
  en: () => import('../../messages/en.json').then(m => m.default),
  fr: () => import('../../messages/fr.json').then(m => m.default),
};

export async function getDictionary(locale: Locale) {
  return dictionaries[locale]?.() ?? dictionaries[defaultLocale]();
}
