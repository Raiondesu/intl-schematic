import { LocaleKey } from 'schema';

/**
 * Opt-in global plugin registry,
 * tracks all plugins included throughout the project to simplify type-checking
 */
export interface PluginRegistry<
  Locale extends Record<string, any> = Record<string, any>,
  Key extends LocaleKey<Locale> = LocaleKey<Locale>,
  PluginInfo = unknown
> {
  [name: string]: {
    args: unknown[];
    info?: unknown;
  };
}

/**
 * An interface that other plugins use
 * to reference another plugin in their code
 */
export interface PluginInterface<
  Name extends keyof PluginRegistry = keyof PluginRegistry,
  LocaleDoc extends Record<string, any> = Record<string, any>
> {
  translate(key: keyof LocaleDoc, ...args: PluginRegistry[Name]['args']): string | undefined;
  match(value: unknown, key: string, doc: Record<string, unknown>): boolean;
  info: Exclude<PluginRegistry[Name]['info'], undefined>;
}

/**
 * Context of the plugin's `translate` function
 */
export interface PluginContext<
  Match = any,
  LocaleDoc extends Record<string, any> = Record<string, any>,
  Key extends keyof LocaleDoc = keyof LocaleDoc,
  Name extends keyof PluginRegistry = string,
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
    [name in keyof PluginRegistry]?: PluginInterface<name, LocaleDoc>;
  };
}

/**
 * @deprecated Internal implementation detail, use {@link createPlugin} instead
 */
export class Plugin<
  Match = any,
  Args extends any[] = any,
  Name extends keyof PluginRegistry = string,
  PluginInfo = unknown,
  LocaleDoc extends Record<string, any> = Record<string, any>,
  Key extends keyof LocaleDoc = keyof LocaleDoc,
> {
  constructor(
    public name: Name,
    public match: (value: unknown, key: string, doc: Record<string, unknown>) => value is Match,
    options: {
      translate?(this: PluginContext<Match, LocaleDoc, Key, Name>, ...args: Args): string | undefined;
      info?: PluginInfo;
    }
  ) {
    this.translate = options.translate ?? (() => undefined);
    this.info = options.info as PluginInfo;
  }

  translate: (this: PluginContext<Match, LocaleDoc, Key, Name>, ...args: Args) => string | undefined;
  info: PluginInfo;
}

export const createPlugin: {
  /**
   * A plugin factory, mostly used for type-checking
   *
   * @param name a name for the plugin, will be used as a global plugin registry shortcut for other plugins,
   * must match with the name used in the plugin registry definition
   *
   * @param match a {@link https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates type predicate}
   * that decides whether or not the plugin should be used on a specific key-value pair
   *
   * @param options allows to define the functionality of a plugin. It can do 2 things:
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
): Plugin<Match, Args> => new Plugin(name, match, options);

