import type { Translation, TranslationProxy } from './ts.schema';
import type { Processors, defaultProcessors } from './processors';
import type { Plugin } from './plugins/core';
export * from './ts.schema.d';
interface Options<P extends Processors, Locale extends Translation> {
    processors?: P;
    plugins?: Plugin<Locale, P>[];
}
/**
 * Creates a translation function (commonly known as `t()` or `$t()`)
 *
 * @param getLocaleDocument should return a translation document
 * @param currentLocaleId should return a current Intl.Locale
 * @param options
 * @returns a tranlation function that accepts a key to look up in the translation document
 */
export declare const createTranslator: {
    <Locale extends Translation>(getLocaleDocument: () => Locale | undefined, currentLocaleId: () => Intl.Locale | undefined, options?: Omit<Options<typeof defaultProcessors, Locale>, 'processors'>): TranslationProxy<Locale, typeof defaultProcessors>;
    <Locale extends Translation, P extends Processors>(getLocaleDocument: () => Locale | undefined, currentLocaleId: () => Intl.Locale | undefined, options?: Options<P, Locale>): TranslationProxy<Locale, P>;
};
//# sourceMappingURL=index.d.ts.map