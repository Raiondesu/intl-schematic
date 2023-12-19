import { createResource } from 'solid-js';
import { createTranslator } from 'intl-schematic';
import { Plugin } from 'intl-schematic/plugins';

export interface LocaleResponse<Locale> {
  default: Locale;
  remote?: Promise<Locale | undefined>;
}

export function createLocaleResource<P extends readonly Plugin[]>(
  getLocale: () => Intl.Locale | Promise<Intl.Locale>,
  plugins: (locale: () => Intl.Locale) => P,
) {
  return <LocaleDoc extends Record<string, any>>(
    localeImport: (lang: Intl.Locale) => Promise<LocaleResponse<LocaleDoc>>,
  ) => {
    const [localeResource, { mutate }] = createResource(
      getLocale,
      (localePromise) => Promise.resolve(localePromise)
        .then(loc => Promise.all([localeImport(loc), loc] as const))
        .then(([localeDoc, locale]) => {
          localeDoc.remote?.then(loc => {
            if (loc) {
              mutate(([prev, prevLocale] = [localeDoc.default, locale]) => (
                [{ ...prev, ...loc }, prevLocale]
              ));
            }
          });

          return [localeDoc.default, locale] as const;
        })
    );

    const currentLocale = () => localeResource.latest?.[1] ?? new Intl.Locale(navigator.language);
    const currentDoc = () => localeResource.latest?.[0];

    return createTranslator(currentDoc, plugins(currentLocale));
  };
}
