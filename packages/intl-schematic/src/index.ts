import type { LocaleKey } from 'schema';
import type { PluginContext, PluginInterface, Plugin, PluginRegistry } from './plugins/core';

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
  return function translate<K extends LocaleKey<LocaleDoc>>(this: TranslationContext, key: K, ...args: unknown[]) {
    const doc = getLocaleDocument();

    const contextPlugins = this.plugins ?? plugins ?? [];

    for (const [index, plugin] of contextPlugins.entries())
      if (plugin.match(doc[key], key, doc)) {
        const pluginContext: PluginContext = createPluginContext.call(this, plugin, index);

        const pluginResult = plugin.translate.call(pluginContext, key, ...args);

        if (typeof pluginResult === 'string') {
          return pluginResult;
        }
      }

    return doc[key] ?? key;


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

      function translateFromContext(subkey: K, ...args: unknown[]) {
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
  };
}

export type PMatch<P extends readonly Plugin[]> = (
  P extends readonly Plugin<infer Match, any>[] ? Match : never
);

type NamePerPlugin<P extends readonly Plugin[]> = {
  [key in keyof P]: P[key] extends Plugin<any, any, infer Name> ? Name : never;
};

type MatchPerPlugin<P extends readonly Plugin[], Names extends NamePerPlugin<P> = NamePerPlugin<P>> = {
  [key in keyof Names & keyof P & `${number}` as Names[key]]: P[key] extends Plugin<infer Match, any> ? Match : never;
};

type InfoPerPlugin<P extends readonly Plugin[], Names extends NamePerPlugin<P> = NamePerPlugin<P>> = {
  [key in keyof Names & keyof P & `${number}` as Names[key]]: P[key] extends Plugin<any, any, any, infer Info> ? Info : never;
};

type KeysOfType<O, T> = {
  [K in keyof O]: T extends O[K] ? K : never
}[keyof O];

export type SimpleTranslationFunction<Locale extends Record<string, any>> = {
  (key: keyof Locale): string;
  (this: { plugins?: Plugin[] }, key: keyof Locale): string;
};

export type TranslationFunction<
  LocaleDoc extends Record<string, any>,
  P extends readonly Plugin[]
> = {
  <
    K extends LocaleKey<LocaleDoc>,
    PluginKey extends KeysOfType<MatchPerPlugin<P>, LocaleDoc[K]> = KeysOfType<MatchPerPlugin<P>, LocaleDoc[K]>
  >(
    key: K,
    ...args: PluginRegistry<LocaleDoc, K, InfoPerPlugin<P>[PluginKey]>[PluginKey]['args']
  ): string;

  <
    K extends LocaleKey<LocaleDoc>,
    PluginKey extends KeysOfType<MatchPerPlugin<P>, LocaleDoc[K]> = KeysOfType<MatchPerPlugin<P>, LocaleDoc[K]>
  >(
    this: { plugins?: Plugin[] },
    key: K,
    ...args: PluginRegistry<LocaleDoc, K, InfoPerPlugin<P>[PluginKey]>[PluginKey]['args']
  ): string;
}
