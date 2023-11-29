import { Processor, Processors } from '../processors';
import { InputObject, ParameterObject, ParametrizedTranslationRecord } from '../translation.schema';
import { LocaleInputParameter } from '../ts.schema';
import { createPlugin } from './core';
import { mergeInputs } from './merge-inputs';

const localizedProcessorsByLocale: Record<string, Record<string, ReturnType<Processor>>> = {};

let getLocalizedProcessors: (currentLocaleId: () => Intl.Locale | undefined) => Record<string, ReturnType<Processor>> = () => ({});

export const ProcessorPlugin = createPlugin({
  name: 'Processor',
  initPlugin(processors) {
    getLocalizedProcessors = (currentLocaleId: () => Intl.Locale | undefined) => {
      const localeId = currentLocaleId();

      if (!localeId) {
        return {};
      }

      return Object.keys((processors as Processors)).reduce((obj, key) => ({
        ...obj,
        [key]: (processors as Processors)[key as keyof Processors](localeId),
      }), {} as Record<string, ReturnType<Processor>>);
    };

    return undefined;
  },
  keyFound(record, input, parameter, currentLocaleId, key, doc) {
    const localizedProcessors = (
      localizedProcessorsByLocale[String(currentLocaleId()?.baseName)] ??= getLocalizedProcessors(currentLocaleId)
    );

    // Handle a processed record
    if (isParametrized(record)) {
      const processorName = Object.keys(record.processor)[0];
      const processor = localizedProcessors[processorName];

      if (!processor) {
        return this.callHook('processorNotFound', record);
      }

      // Delete undefined keys to make defaults bypass them in the spread later
      const mergedInput = mergeInputs(
        record.input,
        input as InputObject
      );

      const mergedParameter = {
        ...record.parameter,
        ...parameter as ParameterObject,
      };

      const getProcessedResult = processor(mergedParameter, key, doc);

      const result = getProcessedResult(mergedInput, mergedParameter);

      return result
        ? this.callHook('keyProcessed', result)
        : (this.callHook('keyNotProcessed', result) ?? this.callHook('keyNotFound', result));
    }

  }
});

function isParametrized(key: unknown): key is ParametrizedTranslationRecord {
  return typeof key === 'object' && key != null && 'processor' in key && 'parameter' in key && 'input' in key;
}
