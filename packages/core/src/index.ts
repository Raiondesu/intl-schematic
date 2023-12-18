import type {
  PluginContext,
  PluginInterface,
  Plugin,
  PluginRegistry,
  GetPluginNameFromArray,
  PMatch,
  GetPluginFromArray
} from './plugins';

interface TranslationContext {
  plugins?: readonly Plugin[];
  pluginContext?: PluginContext;
}

/**
 * Creates a translation function (commonly known as `t()` or `$t()`)
 *
 * @param getLocaleDocument should return a translation document
 * @returns a tranlation function that accepts a key to look up in the translation document
 */
export function createTranslator<Locale extends Record<string, string>>(
  getLocaleDocument: () => Locale | undefined,
): SimpleTranslationFunction<Locale>;

/**
 * Creates a translation function (commonly known as `t()` or `$t()`)
 *
 * @param getLocaleDocument should return a translation document
 * @param plugins an array of plugins, each will be applied to the translation key in their respective order
 * @returns a tranlation function that accepts a key to look up in the translation document
 */
export function createTranslator<
  const P extends readonly Plugin[],
  LocaleDoc extends Record<string, PMatch<P> | string>,
>(
  getLocaleDocument: () => LocaleDoc,
  plugins: P,
): TranslationFunction<LocaleDoc, P>;

export function createTranslator<
  const P extends readonly Plugin[],
  LocaleDoc extends Record<string, PMatch<P> | string>,
>(
  getLocaleDocument: () => LocaleDoc,
  plugins?: P,
): any {
  return (function translate(this: TranslationContext, key: string, ...args: unknown[]) {
    const doc = getLocaleDocument();

    // Skip expensive plugin checks if key is not found anyway
    if (!(key in doc)) {
      return key;
    }

    const contextPlugins = this.plugins ?? plugins ?? [];

    for (const [index, plugin] of contextPlugins.entries())
      if (plugin.match(doc[key], key, doc)) {
        const pluginContext: PluginContext = createPluginContext.call(this, plugin, index);

        // Do not break if a plugin stops working
        try {
          const pluginResult = plugin.translate.call(pluginContext, ...args);

          if (typeof pluginResult === 'string') {
            return pluginResult;
          }
        } catch {}
      }

    const plainKey = doc[key];

    return typeof plainKey === 'string' ? plainKey : key;


    function createPluginContext(
      this: TranslationContext,
      plugin: Plugin,
      index: number
    ): PluginContext {
      const contextualPlugins = contextPlugins.reduce<PluginContext['plugins']>((obj, pl) => ({
        ...obj,
        [pl.name]: createPluginInterface(pl),
      }), {});

      const createdContext: PluginContext = {
        name: plugin.name,
        originalCallArgs: args,
        originalKey: key,
        originalValue: doc[key],

        ...this.pluginContext,

        plugins: contextualPlugins,

        doc,
        key,
        value: doc[key],

        translate: translateFromContext,
      };

      return createdContext;

      function translateFromContext(subkey: string, ...args: unknown[]) {
        return translate.call({
          plugins: subkey !== key
            ? contextPlugins
            : contextPlugins?.slice(index),
          pluginContext: createdContext,
        }, subkey, ...args)
      }

      function createPluginInterface(pt: Plugin): PluginInterface | undefined {
        return {
          translate: (subkey, ...args) => (
            pt.translate.call({
              ...createdContext,
              key: subkey,
              value: doc[subkey]
            }, ...args)
          ),
          match: pt.match,
          info: pt.info,
        };
      }
    }
  }).bind({ plugins });
}

export type SimpleTranslationFunction<LocaleDoc extends Record<string, any>> = {
  (key: LocaleKey<LocaleDoc>): string;
};

export type TranslationFunction<
  LocaleDoc extends Record<string, any>,
  P extends readonly Plugin[]
> = {
  /**
   * Translate a key from a translation document
   *
   * @param key a key to translate from
   * @param args optional parameters for plugins used for the chosen key
   */
  <
    K extends LocaleKey<LocaleDoc>,
    PluginKey extends keyof PluginRegistry = GetPluginNameFromArray<LocaleDoc, K, P>,
    _Signature = GetPluginFromArray<LocaleDoc, K, P, PluginKey>['signature']
  >(
    key: K,
    ...args: GetPluginFromArray<LocaleDoc, K, P, PluginKey>['args']
  ): string;
}

export interface TranslationDocument {
  [key: string]: unknown;
}

export type LocaleKey<Locale extends TranslationDocument> = Exclude<keyof Locale, '$schema'>;

export type ExtraPartial<I> = {
  [P in keyof I]?: I[P] | null | undefined;
};

export type FlatType<T> = T extends object ? { [K in keyof T]: FlatType<T[K]> } : T;
