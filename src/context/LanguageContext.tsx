import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, Translations, translations } from '../i18n/translations';

interface LanguageContextType {
  language: Language;
  direction: 'rtl' | 'ltr';
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: keyof Translations) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LOCAL_STORAGE_LANG_KEY = 'lumi_app_language';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const language: Language = 'ar';
  const direction: 'rtl' | 'ltr' = 'rtl';

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = 'ar';
      document.documentElement.dir = 'rtl';
      try {
        localStorage.removeItem(LOCAL_STORAGE_LANG_KEY);
      } catch {
        // Ignore localStorage errors
      }
    }
  }, []);

  const setLanguage = (_lang: Language) => {
    // App is exclusively Arabic as requested
  };

  const toggleLanguage = () => {
    // App is exclusively Arabic as requested
  };

  const t = (key: keyof Translations): string => {
    return translations.ar[key] || (translations.en ? translations.en[key] : key) || key;
  };

  return (
    <LanguageContext.Provider value={{ language, direction, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
