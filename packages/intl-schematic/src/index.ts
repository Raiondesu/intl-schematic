import type { LocaleInputParameter, LocaleKey, LocaleOptionsParameter, Translation, TranslationProxy } from './ts.schema';
import type { Processors, defaultProcessors } from './plugins/processors/default';
import { callPlugins } from './plugins/core';
import type { Plugin } from './plugins/core';

export * from './ts.schema.d';

// TODO: decouple processor architecture from plugins
interface Options<P extends Processors, Locale extends Translation> {
  processors?: P;
  plugins?: Plugin<Locale, P>[];
}

/**
 * Creates a translation function (commonly known as `t()` or `$t()`)
 *
 * @param getLocaleDocument should return a translation document
 * @param currentLocaleId should return a current Intl.Locale
 * @param options
 * @returns a tranlation function that accepts a key to look up in the translation document
 */
export const createTranslator: {
  <Locale extends Translation>(
    getLocaleDocument: () => Locale | undefined,
    currentLocaleId: () => Intl.Locale | undefined,
    options?: Omit<Options<typeof defaultProcessors, Locale>, 'processors'>,
  ): TranslationProxy<Locale, typeof defaultProcessors>;

  <Locale extends Translation, P extends Processors>(
    getLocaleDocument: () => Locale | undefined,
    currentLocaleId: () => Intl.Locale | undefined,
    options?: Options<P, Locale>
  ): TranslationProxy<Locale, P>;
} = <Locale extends Translation>(
  getLocaleDocument: () => Locale | undefined,
  currentLocaleId: () => Intl.Locale | undefined,
  options: Options<Processors, Locale> = {},
) => {
  const {
    processors = {} as Processors,
    plugins = [],
  } = options;

  const translate = function <K extends LocaleKey<Locale>>(
    key: K,
    input?: LocaleInputParameter<Locale, LocaleKey<Locale>, Processors>,
    parameter?: LocaleOptionsParameter<Locale, LocaleKey<Locale>, Processors>
  ): string {
    const doc = getLocaleDocument();

    const callHook = (
      hook: keyof Omit<Plugin<Locale, Processors>, 'name'>,
      value?: unknown,
      _input: typeof input = input,
    ) => callPluginsHook(hook, value, _input, parameter, currentLocaleId, key, doc) ?? key;

    if (!doc) {
      return callHook('docNotFound');
    }

    const currentKey = doc[key];

    if (currentKey == null) {
      return callHook('keyNotFound', key);
    }

    // Process a plain-string
    if (typeof currentKey === 'string') {
      return callHook('keyProcessed', currentKey);
    }

    // Process a function record
    // TODO: move into a plugin
    if (typeof currentKey === 'function') {
      return callHook('keyProcessed', currentKey(...(Array.isArray(input) ? input : [])));
    }

    return callHook('keyFound', currentKey);
  } as TranslationProxy<Locale, Processors>;

  const callPluginsHook = callPlugins(translate, plugins);

  // Initialize plugins
  callPluginsHook('initPlugin', processors, undefined, undefined, currentLocaleId, '', undefined, undefined);

  return translate;
};
