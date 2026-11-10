import type { Language } from '../content/language';

/**
 * A language is named in its own language: the switcher always shows the
 * target language's endonym, so these labels are intentionally not translated.
 */
const LANGUAGE_NAMES: Record<Language, string> = {
  en: 'English',
  es: 'Español',
};

export function languageName(language: Language): string {
  return LANGUAGE_NAMES[language];
}

export function otherLanguage(language: Language): Language {
  return language === 'en' ? 'es' : 'en';
}

/**
 * Canonical pages are identified by their English path: the Spanish page of
 * `/experience` is `/es/experience`, and the Spanish home page is `/es`.
 */
export function localizedPath(path: string, language: Language): string {
  if (language === 'en') {
    return path;
  }

  return path === '/' ? '/es' : `/es${path}`;
}
