import type { LocaleInputParameter, LocaleKey, LocaleOptionsParameter, Translation, TranslationProxy } from './ts.schema';
import type { InputObject, ParameterObject, ParametrizedTranslationRecord } from './translation.schema';
import type { Processor, Processors, defaultProcessors } from './processors';
import { ResolveMissingKeyPlugin, callPlugins } from './plugins';
import type { Plugin } from './plugins';

export * from './ts.schema.d';

const isProcessedKey = (k: object): k is ParametrizedTranslationRecord => 'processor' in k && typeof k['processor'] === 'object';

interface Options<P extends Processors, Locale extends Translation> {
  processors?: P;
  plugins?: Plugin<Locale>[];
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
    plugins = [ResolveMissingKeyPlugin],
  } = options;

  const plugin = callPlugins(plugins);

  const localizedProcessorsByLocale: Record<string, Record<string, ReturnType<Processor>>> = {};

  function getLocalizedProcessors() {
    const localeId = currentLocaleId();

    if (!localeId) {
      return {};
    }

    return Object.keys(processors).reduce((obj, key) => ({
      ...obj,
      [key]: processors[key as keyof Processors](localeId),
    }), {} as Record<string, ReturnType<Processor>>);
  }

  return function translate<K extends LocaleKey<Locale>>(
    key: K,
    input?: LocaleInputParameter<Locale, LocaleKey<Locale>, Processors>,
    parameter?: LocaleOptionsParameter<Locale, LocaleKey<Locale>, Processors>
  ): string {
    const doc = getLocaleDocument();

    const call = (
      hook: keyof Omit<Plugin<Locale>, 'name'>,
      value?: string,
      processor?: string,
      _input: typeof input = input,
    ) => plugin(hook, key, _input, value, processor, doc) ?? key;

    if (!doc) {
      return call('docNotFound');
    }

    const localizedProcessors = (
      localizedProcessorsByLocale[String(currentLocaleId()?.baseName)] ??= getLocalizedProcessors()
    );

    const currentKey = doc[key];

    if (typeof currentKey === 'undefined') {
      return call('keyNotFound');
    }

    // Process an array record (["Some text", "translation-key"])
    // TODO: move into a plugin
    if (Array.isArray(currentKey)) {
      const result = currentKey.reduce((arr, refK) => {
        if (typeof refK !== 'string') {
          const refParamK = Object.keys(refK)[0] as K;

          if (refParamK.startsWith('input:')) {
            const key = refParamK.replace('input:', '');
            const value = (input as Record<string, typeof input>)?.[key];

            return [
              ...arr,
              // TOOD: add a way to get a stringifier for a processors input
              String(value)
            ];
          }

          if (refK.__ignore) {
            return arr;
          }

          return [...arr, translate(
            refParamK,
            (input as Record<string, typeof input>)?.[refParamK],
            (parameter as Record<string, typeof parameter>)?.[refParamK]
          )];
        }

        if (!refK.startsWith('input:')) {
          return [...arr, translate(
            refK as K,
            (input as Record<string, typeof input>)?.[refK],
            (parameter as Record<string, typeof parameter>)?.[refK]
          )];
        }

        const _input = input as Record<string, typeof input>;
        const inputKey = refK.replace('input:', '');

        return [...arr, _input[inputKey] as string];
      }, [] as string[]).join(' ');

      return call('keyProcessed', result);
    }

    // Process a function record
    // TODO: move into a plugin
    if (typeof currentKey === 'function') {
      const inputContainsArgs = typeof input === 'object' && input && 'args' in input && Array.isArray(input.args);

      return call('keyProcessed', currentKey(...(inputContainsArgs ? input.args as [] : [])));
    }

    // Process a plain-string
    if (typeof currentKey !== 'object') {
      return currentKey ? call('keyFound', currentKey) : call('keyNotFound');
    }

    // Process an object record that doesn't specify a processor
    // TODO: move into a plugin
    if (!isProcessedKey(currentKey)) {
      return call(
        'keyProcessed',
        Object.keys(currentKey).map((refKey) => {
          const inputForKey = typeof input === 'object' && input ? input[refKey as keyof typeof input] : {};
          const translated = translate(
            refKey as LocaleKey<Locale>,
            (
              typeof input === 'object' && input
                ? mergeInputs(
                    currentKey[refKey],
                    inputForKey ?? null
                  )
                : currentKey[refKey]
            ) as LocaleInputParameter<Locale, LocaleKey<Locale>, Processors>
          );

          return translated;
        }).join(' ').replace(/\s+/, ' ')
      );
    }

    // Process a parametrized record using a processor:
    // TODO: move into a plugin

    const processorName = Object.keys(currentKey.processor)[0];
    const processor = localizedProcessors[processorName];

    if (!processor) {
      return call('processorNotFound', key, processorName);
    }

    // Delete undefined keys to make defaults bypass them in the spread later
    const mergedInput = mergeInputs(
      currentKey.input,
      input as InputObject
    );

    const mergedParameter = {
      ...currentKey.parameter,
      ...parameter as ParameterObject,
    };

    const getProcessedResult = processor(mergedParameter, key, doc);

    const result = getProcessedResult(mergedInput, mergedParameter);

    return result
      ? call('keyProcessed', result, processorName)
      : (call('keyNotProcessed', result, processorName) ?? call('keyNotFound', result, processorName));
  } as TranslationProxy<Locale, Processors>;
};

function mergeInputs(
  baseInput: InputObject,
  input: InputObject,
) {
  if (typeof input === 'object' && input != null) {
    for (const prop in input)
      if (input[prop] == null) {
        delete input[prop];
      }
  }

  const mergedInput = typeof baseInput === 'object' && typeof input === 'object'
    ? { ...baseInput, ...input }
    : (input ?? baseInput);

  return mergedInput;
}
