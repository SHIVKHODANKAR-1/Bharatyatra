import React, { createContext, useContext, useState, useEffect } from 'react';
import { en } from './en';
import { hi } from './hi';
import { mr } from './mr';
import { LanguageCode } from '../types/auth';

export const DICTIONARIES = {
  en,
  hi,
  mr,
};

const translations = DICTIONARIES;

export type Translations = typeof en;

interface I18nContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: Translations;
  dir: 'ltr' | 'rtl';
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const STORAGE_KEY = 'bharat_yatra_lang';

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as LanguageCode | null;
      if (saved && (saved === 'en' || saved === 'hi' || saved === 'mr')) {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'en';
  });

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const value: I18nContextType = {
    language,
    setLanguage,
    t: translations[language] || en,
    dir: 'ltr',
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
