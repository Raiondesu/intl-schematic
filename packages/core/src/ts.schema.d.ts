export interface TranslationDocument {
  [key: string]: unknown;
}

export type LocaleKey<Locale extends TranslationDocument> = Exclude<keyof Locale, '$schema'>;

export type ExtraPartial<I> = {
  [P in keyof I]?: I[P] | null | undefined;
};

export type FlatType<T> = T extends object ? { [K in keyof T]: FlatType<T[K]> } : T;
