export interface TranslationDocuemnt {
  [key: string]: unknown;
}

export type LocaleKey<Locale extends TranslationDocuemnt> = Exclude<keyof Locale, '$schema'>;

export type ExtraPartial<I> = {
  [P in keyof I]?: I[P] | null | undefined;
};
