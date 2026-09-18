import React, { createContext, useContext, ReactNode } from 'react';
import { useLocale, SupportedLocale } from '../hooks/useLocale';
import { TranslationDictionary } from './dictionaries';

interface I18nContextType {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  updateLanguage: (locale: SupportedLocale) => void;
  t: (key: string) => string;
  direction: 'ltr' | 'rtl';
  currentDictionary: TranslationDictionary | any;
  availableLocales: { code: SupportedLocale; name: string; nativeName: string; flag: string }[];
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const SUPPORTED_LOCALES_META: { code: SupportedLocale; name: string; nativeName: string; flag: string }[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
];

export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { locale, setLocale, t, direction, currentDictionary } = useLocale();

  return (
    <I18nContext.Provider
      value={{
        locale,
        setLocale,
        updateLanguage: setLocale,
        t,
        direction,
        currentDictionary: currentDictionary || {
          locale,
          direction,
          name: 'English',
          nativeName: 'English',
          translations: {},
        },
        availableLocales: SUPPORTED_LOCALES_META,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};

export default I18nContext;
