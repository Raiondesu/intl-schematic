import { createResource } from 'solid-js';
import { merge } from 'rambda';

import { Processors, defaultPlugins } from '@intl-schematic/plugin-defaults';
import { createTranslator } from 'intl-schematic';

export interface LocaleResponse<Locale> {
  default: Locale;
  remote?: Promise<Locale | undefined>;
}

export function createLocaleResource<P extends Processors>(
  getLocale: () => Intl.Locale | Promise<Intl.Locale>,
  processors: P,
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
              mutate((prev) => merge(prev, loc));
            }
          });

          return [localeDoc.default, locale] as const;
        })
    );

    const currentLocale = () => localeResource.latest?.[1] ?? new Intl.Locale(navigator.language);
    const currentDoc = () => localeResource.latest?.[0] ?? {} as LocaleDoc;

    return createTranslator(currentDoc, defaultPlugins(currentLocale, processors));
  };
}
