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
