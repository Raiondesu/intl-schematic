import { createResource } from 'solid-js';
import { merge } from 'rambda';

import type { TranslationDocument as Translation } from 'intl-schematic/translation.schema';
import { Processors } from 'intl-schematic/processors';
import { defaultPlugins } from 'intl-schematic/plugins';
import { createTranslator } from 'intl-schematic';

export interface LocaleResponse<Locale> {
  default: Locale;
  remote?: Promise<Locale | undefined>;
}

export function createLocaleResource<Locale extends Translation, P extends Processors>(
  getLocale: () => Intl.Locale | Promise<Intl.Locale>,
  localeImport: (lang: Intl.Locale) => Promise<LocaleResponse<Locale>>,
  processors: P,
) {
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

  const currentLocale = () => localeResource.latest?.[1] ?? new Intl.Locale(navigator.language);
  const currentDoc = () => localeResource.latest?.[0] ?? {};

  return createTranslator(currentDoc, defaultPlugins(currentLocale, processors));
};
