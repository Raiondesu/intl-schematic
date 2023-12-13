import { LocaleKey } from 'schema';

export interface Plugins<
  Locale extends Record<string, any> = Record<string, any>,
  Key extends LocaleKey<Locale> = LocaleKey<Locale>,
  PluginInfo = unknown
> {
  [name: string]: unknown[];
}

export interface PluginContext<
  Match,
  Locale extends Record<string, any> = Record<string, any>,
  Key extends keyof Locale = keyof Locale,
  Name extends keyof Plugins = string,
> {
  value: Match;
  key: Key;
  doc: Locale;
  locale: Intl.Locale;
  translate(key: keyof Locale, ...args: unknown[]): string;
  plugins: {
    [name in keyof Plugins]?: {
      translate(key: keyof Locale, ...args: Plugins[name]): string;
      match(value: any): boolean;
    };
  };
}

export interface PluginTemplate<
  Match,
  Args extends any[],
  Name extends keyof Plugins = string,
  PluginInfo = unknown,
  Locale extends Record<string, any> = Record<string, any>,
  Key extends keyof Locale = keyof Locale,
> {
  name: Name;
  match(value: unknown, key: string, doc: Record<string, unknown>): value is Match;
  translate(this: PluginContext<Match, Locale, Key, Name>, ...args: Args): string;
  info: PluginInfo;
}

export type PMatch<P extends readonly PluginTemplate<any, any>[]> = (
  P extends readonly PluginTemplate<infer Match, any>[] ? Match : never
);

type NamePerPlugin<P extends readonly PluginTemplate<any, any>[]> = {
  [key in keyof P]: P[key] extends PluginTemplate<any, any, infer Name> ? Name : never;
};

type MatchPerPlugin<P extends readonly PluginTemplate<any, any>[], Names extends NamePerPlugin<P> = NamePerPlugin<P>> = {
  [key in keyof Names & keyof P & `${number}` as Names[key]]: P[key] extends PluginTemplate<infer Match, any> ? Match : never;
};

type InfoPerPlugin<P extends readonly PluginTemplate<any, any>[], Names extends NamePerPlugin<P> = NamePerPlugin<P>> = {
  [key in keyof Names & keyof P & `${number}` as Names[key]]: P[key] extends PluginTemplate<any, any, any, infer Info> ? Info : never;
};

type KeysOfType<O, T> = {
  [K in keyof O]: T extends O[K] ? K : never
}[keyof O];

export type SimpleTranslationFunction<Locale extends Record<string, any>> = {
  (key: keyof Locale): string;
};

export type TranslationFunction<
  Locale extends Record<string, any>,
  P extends readonly PluginTemplate<any, any>[]
> = {
  <
    K extends LocaleKey<Locale>,
    PluginKey extends KeysOfType<MatchPerPlugin<P>, Locale[K]> = KeysOfType<MatchPerPlugin<P>, Locale[K]>
  >(
    key: K,
    ...args: Plugins<Locale, K, InfoPerPlugin<P>[PluginKey]>[PluginKey]
  ): string;
}

export const createPlugin: {
  <Name extends keyof Plugins, Match, PluginInfo, Args extends any[] = Plugins[Name]>(
    name: Name,
    match: (value: unknown) => value is Match,
    translate: (this: PluginContext<Match>, ...args: Args) => string,
    info?: PluginInfo
  ): PluginTemplate<Match, Args, Name, PluginInfo>;

  <Match, Args extends any[]>(
    name: string,
    match: (value: unknown) => value is Match,
    translate: (this: PluginContext<Match>, ...args: Args) => string,
  ): PluginTemplate<Match, Args>;
} = <Match, Args extends any[]>(
  name: string,
  match: (value: unknown) => value is Match,
  translate: (this: PluginContext<Match>, ...args: Args) => string,
  info?: unknown,
): PluginTemplate<Match, Args> => ({ name, match, translate, info });
