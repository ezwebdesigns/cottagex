'use client';

import { createContext, useContext, useCallback } from 'react';
import { translations } from './translations';

type Translations = typeof translations.en;
type Lang = keyof typeof translations;

type TranslationsContextType = {
  lang: Lang;
  t: Translations;
  toggleLang: () => void;
};

const TranslationsContext = createContext<TranslationsContextType | null>(null);

export function TranslationsProvider({
  children,
  locale,
  onToggleLang,
}: {
  children: React.ReactNode;
  locale: string;
  onToggleLang?: () => void;
}) {
  const lang = (locale === 'fr' ? 'fr' : 'en') as Lang;
  const t = translations[lang] as Translations;

  const toggleLang = useCallback(() => {
    if (onToggleLang) onToggleLang();
  }, [onToggleLang]);

  return (
    <TranslationsContext.Provider value={{ lang, t, toggleLang }}>
      {children}
    </TranslationsContext.Provider>
  );
}

export function useTranslations() {
  const ctx = useContext(TranslationsContext);
  if (!ctx) {
    throw new Error('useTranslations must be used within TranslationsProvider');
  }
  return ctx;
}
