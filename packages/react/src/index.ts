import { useRef, useEffect, RefObject, useMemo } from 'react';
import { createTranslator } from 'intl-schematic';
import { Plugin } from 'intl-schematic/plugins';

export interface LocaleResponse<Locale> {
  default: Locale;
  remote?: Promise<Locale | undefined>;
}

export function createEffectTranslator<P extends readonly Plugin[]>(
  locale: RefObject<Intl.Locale | undefined>,
  plugins: (getLocale: () => Intl.Locale | undefined) => P,
) {
  return <LocaleDoc extends Record<string, any>>(
    localeImport: (lang: Intl.Locale) => Promise<LocaleResponse<LocaleDoc>>,
  ) => {
    const localeDoc = useRef<LocaleDoc>();

    useEffect((lang = locale?.current) => {
      if (!lang) {
        return;
      }

      localeImport(lang).then(val => {
        localeDoc.current = val.default;

        val.remote?.then(remote => {
          if (remote) {
            localeDoc.current = {
              ...localeDoc.current,
              ...remote,
            };
          }
        })
      });
    }, [locale]);

    const currentLocale = () => locale.current ?? new Intl.Locale(navigator.language);
    const currentDoc = () => localeDoc.current;

    // Integrate useMemo/useCallback here for performance and caching
    return createTranslator(currentDoc, plugins(currentLocale));
  };
}
