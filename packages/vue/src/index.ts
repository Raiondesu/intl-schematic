import { ref, Ref, watch } from 'vue';
import { createTranslator } from 'intl-schematic';
import { Plugin } from 'intl-schematic/plugins';

export interface LocaleResponse<Locale> {
  default: Locale;
  remote?: Promise<Locale | undefined>;
}

export function createLocaleResource<P extends readonly Plugin[]>(
  locale: Ref<Intl.Locale | undefined>,
  plugins: (getLocale: () => Intl.Locale | undefined) => P,
) {
  return <LocaleDoc extends Record<string, any>>(
    localeImport: (lang: Intl.Locale) => Promise<LocaleResponse<LocaleDoc>>,
  ) => {
    const localeDoc = ref<LocaleDoc>();

    watch(locale, (lang) => {
      if (!lang) {
        return;
      }

      localeImport(lang).then(val => {
        localeDoc.value = val.default;

        val.remote?.then(remote => {
          if (remote) {
            localeDoc.value = {
              ...localeDoc.value,
              ...remote,
            };
          }
        })
      });
    });

    const currentLocale = () => locale.value ?? new Intl.Locale(navigator.language);
    const currentDoc = () => localeDoc.value;

    return createTranslator(currentDoc, plugins(currentLocale));
  };
}
