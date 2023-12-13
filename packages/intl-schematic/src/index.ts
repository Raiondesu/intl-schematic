import { LocaleKey } from 'schema';
import type { PMatch, PluginTemplate, SimpleTranslationFunction, TranslationFunction } from './core';
import { NestedKeysPlugin } from './plugins/nested';

/**
 * Creates a translation function (commonly known as `t()` or `$t()`)
 *
 * @param getLocaleDocument should return a translation document
 * @param currentLocaleId should return a current Intl.Locale
 * @returns a tranlation function that accepts a key to look up in the translation document
 */
export function createTranslator<Locale extends Record<string, string>>(
  getLocaleDocument: () => Locale | undefined,
  currentLocaleId: () => Intl.Locale | undefined,
): SimpleTranslationFunction<Locale>;

/**
 * Creates a translation function (commonly known as `t()` or `$t()`)
 *
 * @param getLocaleDocument should return a translation document
 * @param currentLocaleId should return a current Intl.Locale
 * @param plugins
 * @returns a tranlation function that accepts a key to look up in the translation document
 */
export function createTranslator<
  const P extends readonly PluginTemplate<any, any>[],
  Locale extends Record<string, PMatch<P> | string>,
>(
  getLocaleDocument: () => Locale | undefined,
  currentLocaleId: () => Intl.Locale | undefined,
  plugins: P,
): TranslationFunction<Locale, P>;

export function createTranslator<
  const P extends readonly PluginTemplate<any, any>[],
  Locale extends Record<string, PMatch<P> | string>,
>(
  getLocaleDocument: () => Locale | undefined,
  currentLocaleId: () => Intl.Locale | undefined,
  plugins?: P,
): any {
  return function <K extends LocaleKey<Locale>>(key: K) {

  }
  // return plugins;
  // const translate = function <K extends LocaleKey<Locale>>(
  //   key: K,
  //   input?: LocaleInputParameter<Locale, LocaleKey<Locale>, Processors>,
  //   parameter?: LocaleOptionsParameter<Locale, LocaleKey<Locale>, Processors>
  // ): string {
  //   const doc = getLocaleDocument();

  //   const callHook = (
  //     hook: keyof Omit<Plugin<Locale, Processors>, 'name'>,
  //     value?: unknown,
  //     _input: typeof input = input,
  //   ) => callPluginsHook(hook, value, _input, parameter, currentLocaleId, key, doc) ?? key;

  //   if (!doc) {
  //     return callHook('docNotFound');
  //   }

  //   const currentKey = doc[key];

  //   if (currentKey == null) {
  //     return callHook('keyNotFound', key);
  //   }

  //   // Process a plain-string
  //   if (typeof currentKey === 'string') {
  //     return callHook('keyProcessed', currentKey);
  //   }

  //   // Process a function record
  //   // TODO: move into a plugin
  //   if (typeof currentKey === 'function') {
  //     return callHook('keyProcessed', currentKey(...(Array.isArray(input) ? input : [])));
  //   }

  //   return callHook('keyFound', currentKey);
  // } as TranslationProxy<Locale, Processors>;

  // const callPluginsHook = callPlugins(translate, plugins);

  // return translate;
};

const doc = { c: 'c', e: { input: '', parameter: { lol: 'kek' }, processor: { 'date': '' } } };

const t = createTranslator(
  () => doc,
  () => new Intl.Locale(''),
  [NestedKeysPlugin]
);

