import { useState, useEffect, useCallback, useRef } from 'react';

export type SupportedLocale = 'en' | 'ar' | 'tr' | 'it' | 'hi' | 'fr' | 'de' | 'es' | 'zh' | 'ja' | 'ru';

interface LocaleData {
  locale: SupportedLocale;
  direction: 'ltr' | 'rtl';
  name: string;
  nativeName: string;
  translations: Record<string, string>;
}

const LOCAL_STORAGE_KEY = 'zenith_core_locale_hook_v1';

export const useLocale = () => {
  const [currentLocale, setCurrentLocale] = useState<SupportedLocale>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY) as SupportedLocale;
      if (saved) return saved;
    } catch {
      // ignore
    }
    return 'en';
  });

  const [localeData, setLocaleData] = useState<LocaleData | null>(null);
  const [fallbackData, setFallbackData] = useState<LocaleData | null>(null);
  const cacheRef = useRef<Map<string, LocaleData>>(new Map());

  // Load English fallback pack on mount
  useEffect(() => {
    fetch('/src/locales/en.json')
      .then((res) => res.json())
      .then((data: LocaleData) => {
        setFallbackData(data);
        cacheRef.current.set('en', data);
      })
      .catch((err) => console.error('[useLocale] Failed to load English fallback:', err));
  }, []);

  // Lazily fetch the requested language JSON file on demand when currentLocale changes
  useEffect(() => {
    if (cacheRef.current.has(currentLocale)) {
      const cached = cacheRef.current.get(currentLocale)!;
      setLocaleData(cached);
      if (cached?.direction) {
        document.documentElement.dir = cached.direction;
        document.documentElement.setAttribute('dir', cached.direction);
      }
      document.documentElement.lang = currentLocale;
      return;
    }

    let isMounted = true;
    fetch(`/src/locales/${currentLocale}.json`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data: LocaleData) => {
        if (!isMounted) return;
        cacheRef.current.set(currentLocale, data);
        setLocaleData(data);
        if (data?.direction) {
          document.documentElement.dir = data.direction;
          document.documentElement.setAttribute('dir', data.direction);
        }
        document.documentElement.lang = currentLocale;
      })
      .catch(async () => {
        if (!isMounted) return;
        // Fallback to English if requested locale pack fails to load
        try {
          const res = await fetch('/src/locales/en.json');
          const data = await res.json();
          if (isMounted) setLocaleData(data);
        } catch {
          // ignore
        }
      });

    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, currentLocale);
    } catch {
      // ignore
    }

    return () => {
      isMounted = false;
    };
  }, [currentLocale]);

  const setLocale = useCallback((locale: SupportedLocale) => {
    setCurrentLocale(locale);
  }, []);

  // Translation function with missing key detection and fallback to English
  const t = useCallback(
    (key: string): string => {
      if (localeData?.translations && localeData.translations[key]) {
        return localeData.translations[key];
      }
      if (fallbackData?.translations && fallbackData.translations[key]) {
        console.warn(`[useLocale] Missing translation key "${key}" for locale "${currentLocale}". Falling back to English.`);
        return fallbackData.translations[key];
      }
      return key;
    },
    [localeData, fallbackData, currentLocale]
  );

  return {
    locale: currentLocale,
    setLocale,
    t,
    direction: localeData?.direction || fallbackData?.direction || 'ltr',
    currentDictionary: localeData || fallbackData,
  };
};

export default useLocale;
