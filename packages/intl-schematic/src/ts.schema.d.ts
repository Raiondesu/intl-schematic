import type {
  PlainStringTranslationRecord,
  ParametrizedTranslationRecord,
  PlainStringTranslationRecordWithReferences,
} from './translation.schema';
import type { InputParameter, OptionsParameter } from './processors';

export interface TranslationModule {
  [k: string]:
    | PlainStringTranslationRecord
    | ParametrizedTranslationRecord
    | PlainStringTranslationRecordWithReferences
    | ((...args: any[]) => string);
}

export type Translation = TranslationModule;

export type LocaleKey<Locale extends Translation> = Extract<keyof Omit<Locale, '$schema'>, string>;

type ExtraPartial<I> = {
  [P in keyof I]?: I[P] | null | undefined;
};

export type LocaleInputParameter<
  Locale extends Translation,
  K extends LocaleKey<Locale>,
  P extends Processors,
> = null | (
  Locale[K] extends { processor: infer O; input: infer I; }
    ? keyof O extends keyof P
      ? ExtraPartial<InputParameter<P, keyof O>>
      : ExtraPartial<I>
    : Locale[K] extends Array<Record<infer Key, any> | string>
      ? { [key in LocaleKey<Locale> & Key]?: LocaleInputParameter<Locale, key, P>; }
      : Locale[K] extends Record<infer Key, any>
        ? { [key in LocaleKey<Locale> & Key]?: LocaleInputParameter<Locale, key, P>; }
        : string
);

export type LocaleOptionsParameter<
  Locale extends Translation,
  K extends LocaleKey<Locale>,
  P extends Processors,
> = null | (
  Locale[K] extends { processor: infer O; parameter: infer I; }
    ? keyof O extends keyof P
      ? ExtraPartial<OptionsParameter<P, keyof O>>
      : ExtraPartial<I>
    : Locale[K] extends Record<string, any>
      ? { [key in LocaleKey<Locale> & keyof Locale[K]]?: LocaleOptionsParameter<Locale, key, P>; }
      : string
);

export type TranslationFunction<Locale extends Translation, P extends Processors, R = string> = {
  /**
   * A translation function, looks for a specified key in the local translation document to provide a localized string.
   * @param key
   *  - a key from a translation document (usually `{locale}.json`)
   * @param input
   * -- a default value (in case a plain-string translation for the key isn't found)
   *  - an input parameter, if the locale key is parametrized
   * @returns a translated string
   */
  <K extends LocaleKey<Locale>>(
    key: K,
    input?: Locale[K] extends (...args: infer A) => string
      ? { args: A }
      : LocaleInputParameter<Locale, K, P> | null,
    parameter?: LocaleOptionsParameter<Locale, K, P>,
  ): R;
};

export type TranslationProxy<Locale extends Translation, P extends Processors> = TranslationFunction<Locale, P>;
