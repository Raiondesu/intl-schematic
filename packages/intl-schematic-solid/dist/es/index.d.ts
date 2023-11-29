import type { TranslationDocument as Translation } from 'intl-schematic/translation.schema';
import { Processors, defaultProcessors } from 'intl-schematic/processors';
import { TranslationProxy } from 'intl-schematic';
export interface LocaleResponse<Locale> {
    default: Locale;
    remote?: Promise<Locale | undefined>;
}
export declare const createLocaleResource: {
    (locale: () => Promise<Intl.Locale>): <Locale extends Translation>(localeImport: (lang: Intl.Locale) => Promise<LocaleResponse<Locale>>) => TranslationProxy<Locale, typeof defaultProcessors>;
    (locale: () => Intl.Locale): <Locale extends Translation>(localeImport: (lang: Intl.Locale) => Promise<LocaleResponse<Locale>>) => TranslationProxy<Locale, typeof defaultProcessors>;
    <P extends Processors>(locale: () => Promise<Intl.Locale>, processors: P): <Locale extends Translation>(localeImport: (lang: Intl.Locale) => Promise<LocaleResponse<Locale>>) => TranslationProxy<Locale, P>;
    <P extends Processors>(locale: () => Intl.Locale, processors: P): <Locale extends Translation>(localeImport: (lang: Intl.Locale) => Promise<LocaleResponse<Locale>>) => TranslationProxy<Locale, P>;
};
//# sourceMappingURL=index.d.ts.map