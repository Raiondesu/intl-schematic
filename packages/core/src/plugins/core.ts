import { LocaleKey } from '../ts.schema';

/**
 * Opt-in global plugin registry,
 * tracks all plugins included throughout the project to simplify type-checking
 */
export interface PluginRegistry<
  Locale extends Record<string, any> = Record<string, any>,
  Key extends LocaleKey<Locale> = LocaleKey<Locale>,
  PluginInfo = unknown,
  ContextualPlugins extends Record<string, Plugin> = Record<string, Plugin>
> {
  [name: string]: {
    /**
     * Arguments to require when translating a key that matches this plugin
     *
     * Should be a named tuple
     */
    args: unknown[];

    /**
     * Miscellanious information that the plugin uses
     *
     * This is a generic type that is then used as a type guard in PluginRegistry evaluation
     */
    info?: unknown;

    /**
     * This is displayed in a type hint when the user hovers over the translation function invocation
     *
     * Allows to display any important information (for example, original key signature) to the user
     */
    signature?: unknown;
  };
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

