import type { LocaleKey } from './';

export interface PluginRecord<
  Args extends unknown[] = unknown[],
  Info extends unknown = unknown,
  Signature extends unknown = unknown
> {
  /**
   * Arguments to require when translating a key that matches this plugin
   *
   * Should be a named tuple
   */
  args: Args;
  /**
   * Miscellanious information that the plugin uses
   *
   * This is a generic type that is then used as a type guard in PluginRegistry evaluation
   */
  info?: Info;
  /**
   * This is displayed in a type hint when the user hovers over the translation function invocation
   *
   * Allows to display any important information (for example, original key signature) to the user
   */
  signature?: Signature;
}

/**
 * Opt-in global plugin registry,
 * tracks all plugins included throughout the project to simplify type-checking
 */
export interface PluginRegistry<
  LocaleDoc extends Record<string, any> = Record<string, any>,
  Key extends LocaleKey<LocaleDoc> = LocaleKey<LocaleDoc>,
  PluginInfo = unknown,
  ContextualPlugins extends Record<keyof PluginRegistry, Plugin> = Record<string, Plugin>
> {
  [name: string]: PluginRecord;
}

/**
 * An interface that other plugins use
 * to reference another plugin in their code
 */
export interface PluginInterface<
  LocaleDoc extends Record<string, any> = Record<string, any>,
  Key extends LocaleKey<LocaleDoc> = LocaleKey<LocaleDoc>,
  Name extends keyof PluginRegistry<LocaleDoc> = keyof PluginRegistry<LocaleDoc>,
> {
  translate(key: LocaleKey<LocaleDoc>, ...args: PluginRegistry<LocaleDoc, Key>[Name]['args']): string | undefined;
  match(value: unknown, key: string, doc: Record<string, unknown>): boolean;
  info: Exclude<PluginRegistry<LocaleDoc, Key>[Name]['info'], undefined>;
}

/**
 * Context of the plugin's `translate` function
 */
export interface PluginContext<
  Match = any,
  LocaleDoc extends Record<string, any> = Record<string, any>,
  Key extends LocaleKey<LocaleDoc> = LocaleKey<LocaleDoc>,
  Name extends keyof PluginRegistry = string,
> {
  name: Name;
  key: Key;
  value: Match;
  doc: LocaleDoc;
  originalCallArgs: unknown[];
  originalKey: LocaleKey<LocaleDoc>;
  originalValue: unknown;
  translate(key: LocaleKey<LocaleDoc>, ...args: unknown[]): string;
  plugins: {
    [name in keyof PluginRegistry<LocaleDoc, Key>]?: PluginInterface<LocaleDoc, Key, name>;
  };
}

export interface Plugin<
  Match = any,
  Args extends any[] = any,
  Name extends keyof PluginRegistry = string,
  PluginInfo = unknown,
  LocaleDoc extends Record<string, any> = Record<string, any>,
  Key extends LocaleKey<LocaleDoc> = LocaleKey<LocaleDoc>,
> {
  name: Name;
  info: PluginInfo;
  match(value: unknown, key: Key, doc: LocaleDoc): value is Match;
  translate(this: PluginContext<Match, LocaleDoc, Key, Name>, ...args: Args): string | undefined;
}

/**
 * A plugin factory, mostly used for type-checking
 *
 * @param name A name for the plugin, will be used as a global plugin registry shortcut for other plugins,
 * must match with the name used in the plugin registry definition
 *
 * @param match A {@link https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates type predicate}
 * that decides whether or not the plugin should be used on a specific key-value pair
 *
 * @param options Allows to define the functionality of a plugin. It can do 2 things:
 * 1. Provide info and context to other plugins, using the `info` property
 * 2. Provide additional ways of translating a key-value pair from a translation document, using the `translate` method
 *
 * @returns a ready-to-use plugin
 */
export const createPlugin: {
  /**
   * A plugin factory, mostly used for type-checking
   *
   * @param name A name for the plugin, will be used as a global plugin registry shortcut for other plugins,
   * must match with the name used in the plugin registry definition
   *
   * @param match A {@link https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates type predicate}
   * that decides whether or not the plugin should be used on a specific key-value pair
   *
   * @param options Allows to define the functionality of a plugin. It can do 2 things:
   * 1. Provide info and context to other plugins, using the `info` property
   * 2. Provide additional ways of translating a key-value pair from a translation document, using the `translate` method
   *
   * @returns a ready-to-use plugin
   */
  <Name extends keyof PluginRegistry, Match, PluginInfo, Args extends any[] = PluginRegistry[Name]['args']>(
    name: Name,
    match: (value: unknown) => value is Match,
    options: {
      info?: PluginInfo,
      translate?: (this: PluginContext<Match>, ...args: Args) => string | undefined,
    }
  ): Plugin<Match, Args, Name, PluginInfo>;

  /**
   * A plugin factory, mostly used for type-checking
   *
   * @param name A name for the plugin, will be used as a global plugin registry shortcut for other plugins,
   * must match with the name used in the plugin registry definition
   *
   * @param match A {@link https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates type predicate}
   * that decides whether or not the plugin should be used on a specific key-value pair
   *
   * @param options Allows to define the functionality of a plugin.
   * It can provide additional ways of translating a key-value pair
   * from a translation document, using the `translate` method
   *
   * @returns a ready-to-use plugin
   */
  <Match, Args extends any[]>(
    name: string,
    match: (value: unknown) => value is Match,
    options: {
      translate?: (this: PluginContext<Match>, ...args: Args) => string | undefined,
    }
  ): Plugin<Match, Args>;
} = <Match, Args extends any[]>(
  name: string,
  match: (value: unknown) => value is Match,
  options: {
    info?: unknown,
    translate?: (this: PluginContext<Match>, ...args: Args) => string | undefined,
  }
): Plugin<Match, Args> => ({ name, match, translate: options.translate ?? (() => undefined), info: options.info });


export type PMatch<P extends readonly Plugin[]> = (
  [] extends P ? never : P extends readonly Plugin<infer Match, any>[] ? Match : never
);

type NamePerPlugin<P extends readonly Plugin[]> = {
  [key in keyof P]: P[key] extends Plugin<any, any, infer Name> ? Name : never;
};

type MatchPerPlugin<P extends readonly Plugin[], Names extends Record<number, keyof PluginRegistry> = NamePerPlugin<P>> = {
  [key in keyof Names & keyof P & `${number}` as Names[key]]: P[key] extends Plugin<infer Match, any> ? Match : never;
};

export type MatchPerPluginName<P extends Record<string, Plugin>> = {
  [key in keyof P]: P[key] extends Plugin<infer Match, any> ? Match : never;
};

type InfoPerPlugin<P extends readonly Plugin[], Names extends Record<number, keyof PluginRegistry> = NamePerPlugin<P>> = {
  [key in keyof Names & keyof P & `${number}` as Names[key]]: P[key] extends Plugin<any, any, any, infer Info> ? Info : never;
};

type PluginPerPlugin<P extends readonly Plugin[], Names extends Record<number, keyof PluginRegistry> = NamePerPlugin<P>> = {
  [key in Extract<keyof Names & keyof P & `${number}`, keyof PluginRegistry> as Names[key]]: P[key] extends Plugin ? P[key] : never;
};

export type KeysOfType<O, T> = {
  [K in keyof O]: T extends O[K] ? K : never
}[keyof O];

export type TypeOfKeys<O, T> = {
  [K in keyof O]: O[K] extends T ? K : never
}[keyof O];

/**
 * Gets a name of a plugin that processes a specific key
 * from the initial plugin array
 */
export type GetPluginNameFromArray<
  LocaleDoc extends Record<string, any>,
  K extends LocaleKey<LocaleDoc>,
  P extends readonly Plugin[]
> = KeysOfType<MatchPerPlugin<P>, LocaleDoc[K]>;

/**
 * Gets information on a plugin that processes a specific key
 * from the plugin registry
 */
export type GetPluginFromArray<
  LocaleDoc extends Record<string, any>,
  K extends LocaleKey<LocaleDoc>,
  P extends readonly Plugin[],
  PluginKey extends keyof PluginRegistry,
  PluginsInfo extends Record<keyof PluginRegistry, any> = InfoPerPlugin<P>,
> = PluginRegistry<LocaleDoc, K, PluginsInfo[PluginKey], PluginPerPlugin<P>>[PluginKey];

/**
 * Gets a name of a plugin that processes a specific key
 * from a plugin context
 */
export type GetPluginNameFromContext<
  LocaleDoc extends Record<string, any>,
  Key extends LocaleKey<LocaleDoc>,
  ContextualPlugins extends Record<string, Plugin>
> = KeysOfType<MatchPerPluginName<ContextualPlugins>, LocaleDoc[Key]>;
