import { LocaleKey } from 'schema';

export interface Plugins<
  Locale extends Record<string, any> = Record<string, any>,
  Key extends LocaleKey<Locale> = LocaleKey<Locale>,
  PluginInfo = unknown
> {
  [name: string]: {
    args: unknown[];
    info?: unknown;
  };
}

export interface PluginInterface<
  Name extends keyof Plugins = keyof Plugins,
  LocaleDoc extends Record<string, any> = Record<string, any>
> {
  translate(key: keyof LocaleDoc, ...args: Plugins[Name]['args']): string | undefined;
  match(value: unknown, key: string, doc: Record<string, unknown>): boolean;
  info: Exclude<Plugins[Name]['info'], undefined>;
}

export interface PluginContext<
  Match = any,
  LocaleDoc extends Record<string, any> = Record<string, any>,
  Key extends keyof LocaleDoc = keyof LocaleDoc,
  Name extends keyof Plugins = string,
> {
  name: Name;
  key: Key;
  value: Match;
  doc: LocaleDoc;
  originalCallArgs: unknown[];
  originalKey: keyof LocaleDoc;
  originalValue: unknown;
  translate(key: keyof LocaleDoc, ...args: unknown[]): string;
  plugins: {
    [name in keyof Plugins]?: PluginInterface<name, LocaleDoc>;
  };
}

export interface PluginTemplate<
  Match = any,
  Args extends any[] = any,
  Name extends keyof Plugins = string,
  PluginInfo = unknown,
  LocaleDoc extends Record<string, any> = Record<string, any>,
  Key extends keyof LocaleDoc = keyof LocaleDoc,
> {
  name: Name;
  match(value: unknown, key: string, doc: Record<string, unknown>): value is Match;
  translate(this: PluginContext<Match, LocaleDoc, Key, Name>, ...args: Args): string | undefined;
  info: PluginInfo;
}

export type PMatch<P extends readonly PluginTemplate[]> = (
  P extends readonly PluginTemplate<infer Match, any>[] ? Match : never
);

type NamePerPlugin<P extends readonly PluginTemplate[]> = {
  [key in keyof P]: P[key] extends PluginTemplate<any, any, infer Name> ? Name : never;
};

type MatchPerPlugin<P extends readonly PluginTemplate[], Names extends NamePerPlugin<P> = NamePerPlugin<P>> = {
  [key in keyof Names & keyof P & `${number}` as Names[key]]: P[key] extends PluginTemplate<infer Match, any> ? Match : never;
};

type InfoPerPlugin<P extends readonly PluginTemplate[], Names extends NamePerPlugin<P> = NamePerPlugin<P>> = {
  [key in keyof Names & keyof P & `${number}` as Names[key]]: P[key] extends PluginTemplate<any, any, any, infer Info> ? Info : never;
};

type KeysOfType<O, T> = {
  [K in keyof O]: T extends O[K] ? K : never
}[keyof O];

export type SimpleTranslationFunction<Locale extends Record<string, any>> = {
  (key: keyof Locale): string;
  (this: { plugins?: PluginTemplate[] }, key: keyof Locale): string;
};

export type TranslationFunction<
  LocaleDoc extends Record<string, any>,
  P extends readonly PluginTemplate[]
> = {
  <
    K extends LocaleKey<LocaleDoc>,
    PluginKey extends KeysOfType<MatchPerPlugin<P>, LocaleDoc[K]> = KeysOfType<MatchPerPlugin<P>, LocaleDoc[K]>
  >(
    key: K,
    ...args: Plugins<LocaleDoc, K, InfoPerPlugin<P>[PluginKey]>[PluginKey]['args']
  ): string;

  <
    K extends LocaleKey<LocaleDoc>,
    PluginKey extends KeysOfType<MatchPerPlugin<P>, LocaleDoc[K]> = KeysOfType<MatchPerPlugin<P>, LocaleDoc[K]>
  >(
    this: { plugins?: PluginTemplate[] },
    key: K,
    ...args: Plugins<LocaleDoc, K, InfoPerPlugin<P>[PluginKey]>[PluginKey]['args']
  ): string;
}

export const createPlugin: {
  <Name extends keyof Plugins, Match, PluginInfo, Args extends any[] = Plugins[Name]['args']>(
    name: Name,
    match: (value: unknown) => value is Match,
    translate: (this: PluginContext<Match>, ...args: Args) => string | undefined,
    info?: PluginInfo,
  ): PluginTemplate<Match, Args, Name, PluginInfo>;

  <Match, Args extends any[]>(
    name: string,
    match: (value: unknown) => value is Match,
    translate: (this: PluginContext<Match>, ...args: Args) => string | undefined,
  ): PluginTemplate<Match, Args>;
} = <Match, Args extends any[]>(
  name: string,
  match: (value: unknown) => value is Match,
  translate: (this: PluginContext<Match>, ...args: Args) => string | undefined,
  info?: unknown,
): PluginTemplate<Match, Args> => ({ name, match, translate, info });
