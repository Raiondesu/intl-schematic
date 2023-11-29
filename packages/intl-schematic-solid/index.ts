import { createResource } from 'solid-js';
import { merge } from 'rambda';

import type { TranslationDocument as Translation } from 'intl-schematic/translation.schema';
import { Processors, defaultProcessors } from 'intl-schematic/processors';
import { defaultPlugins } from 'intl-schematic/plugins';
import { TranslationProxy, createTranslator } from 'intl-schematic';

export interface LocaleResponse<Locale> {
  default: Locale;
  remote?: Promise<Locale | undefined>;
}

export const createLocaleResource: {
  (locale: () => Promise<Intl.Locale>): <Locale extends Translation>(
    localeImport: (lang: Intl.Locale) => Promise<LocaleResponse<Locale>>,
  ) => TranslationProxy<Locale, typeof defaultProcessors>;

  (locale: () => Intl.Locale): <Locale extends Translation>(
    localeImport: (lang: Intl.Locale) => Promise<LocaleResponse<Locale>>,
  ) => TranslationProxy<Locale, typeof defaultProcessors>;

  <P extends Processors>(locale: () => Promise<Intl.Locale>, processors: P): <Locale extends Translation>(
    localeImport: (lang: Intl.Locale) => Promise<LocaleResponse<Locale>>
  ) => TranslationProxy<Locale, P>;

  <P extends Processors>(locale: () => Intl.Locale, processors: P): <Locale extends Translation>(
    localeImport: (lang: Intl.Locale) => Promise<LocaleResponse<Locale>>
  ) => TranslationProxy<Locale, P>;
} = <P extends Processors>(getLocale: () => Intl.Locale | Promise<Intl.Locale>, processors?: P) => <Locale extends Translation>(
  localeImport: (lang: Intl.Locale) => Promise<LocaleResponse<Locale>>
) => {
  const [localeResource, { mutate }] = createResource(
    getLocale,
    (localePromise) => Promise.resolve(localePromise)
      .then(loc => Promise.all([localeImport(loc), loc] as const))
      .then(([localeDoc, locale]) => {
        localeDoc.remote?.then(loc => {
          if (loc) {
            mutate((prev) => merge(prev, loc));
          }
        });

        return [localeDoc.default, locale] as const;
      })
  );

  return createTranslator(() => localeResource.latest?.[0], () => localeResource.latest?.[1], {
    processors: processors ?? defaultProcessors,
    plugins: defaultPlugins,
  });
};
