import type { LocaleInputParameter, LocaleKey, LocaleOptionsParameter, Translation, TranslationProxy } from './ts.schema';
import type { Processors, defaultProcessors } from './processors';
import { callPlugins } from './plugins/core';
import type { Plugin } from './plugins/core';

export * from './ts.schema.d';

// TODO: decouple architecture from plugins
interface Options<P extends Processors, Locale extends Translation> {
  processors?: P;
  plugins?: Plugin<Locale, P>[];
}

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
      processor?: string,
      _input: typeof input = input,
    ) => callPluginsHook(hook, value, _input, parameter, currentLocaleId, key, doc, processor) ?? key;

    if (!doc) {
      return callHook('docNotFound');
    }

    const currentKey = doc[key];

    if (typeof currentKey === 'undefined') {
      return callHook('keyNotFound');
    }

    // Process a plain-string
    if (typeof currentKey !== 'object' && typeof currentKey !== 'function') {
      return currentKey ? callHook('keyProcessed', currentKey) : callHook('keyNotFound');
    }

    // Process a function record
    // TODO: move into a plugin
    if (typeof currentKey === 'function') {
      const inputContainsArgs = typeof input === 'object' && input && 'args' in input && Array.isArray(input.args);

      return callHook('keyProcessed', currentKey(...(inputContainsArgs ? input.args as [] : [])));
    }

    return callHook('keyFound', currentKey);
  } as TranslationProxy<Locale, Processors>;

  const callPluginsHook = callPlugins(translate, plugins);

  callPluginsHook('initPlugin', processors, undefined, undefined, currentLocaleId, '', undefined, undefined);

  return translate;
};
