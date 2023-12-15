import type {
  PlainStringTranslationRecord,
  ParametrizedTranslationRecord,
  PlainStringTranslationRecordWithReferences,
} from './translation.schema';
import type { InputParameter, OptionsParameter } from './plugins/processors';

export interface TranslationModule {
  [k: string]:
    | PlainStringTranslationRecord
    | ParametrizedTranslationRecord
    | PlainStringTranslationRecordWithReferences
    | ((...args: any[]) => string);
}

export type Translation = TranslationModule;

export type LocaleKey<Locale extends Translation> = Extract<keyof Omit<Locale, '$schema'>, string>;

export type ExtraPartial<I> = {
  [P in keyof I]?: I[P] | null | undefined;
};
