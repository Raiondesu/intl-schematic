import { createPlugin } from 'core';
import { mergeInputs } from 'core/merge-inputs';

import { InputParameter, OptionsParameter, Processor, Processors } from './core';
import { InputObject, ParameterObject, ParametrizedTranslationRecord } from '../../translation.schema';
import { ExtraPartial, LocaleKey, Translation } from 'schema';

declare module 'intl-schematic/core' {
  export interface Plugins<Locale, Key, PluginInfo> {
    ProcessorPlugin: PluginInfo extends Processors
      ? [
        input?: LocaleInputParameter<Locale, Key, PluginInfo>,
        parameter?: LocaleOptionsParameter<Locale, Key, PluginInfo>
      ]
      : [input?: unknown, parameter?: unknown];
  }
}

const getLocalizedProcessors = (processors: Processors, locale: Intl.Locale | undefined) => {
  if (!locale) {
    return {};
  }

  return Object.keys((processors)).reduce((obj, key: keyof Processors) => ({
    ...obj,
    [key]: (processors)[key](locale),
  }), {} as Record<string, ReturnType<Processor>>);
};

/**
 * This plugin enables usage of custom translation pocessors
 */
export const ProcessorPlugin = <P extends Processors>(processors: P) => {
  const localizedProcessorsByLocale: Record<string, Record<string, ReturnType<Processor>>> = {};

  return createPlugin(
    'ProcessorPlugin',

    function match(value): value is ParametrizedTranslationRecord {
      return isParametrized(value);
    },

    function translate(input: InputObject, parameter: ParameterObject) {
      const localizedProcessors = (
        localizedProcessorsByLocale[String(this.locale.baseName)] ??= getLocalizedProcessors(processors, this.locale)
      );

      const processorName = Object.keys(this.value.processor)[0];
      const processor = localizedProcessors[processorName];

      if (!processor) {
        return this.translate(this.key);
      }

      // Delete undefined keys to make defaults bypass them in the spread later
      const mergedInput = mergeInputs(
        this.value.input,
        input
      );

      const mergedParameter = {
        ...this.value.parameter,
        ...parameter,
      };

      const getProcessedResult = processor(mergedParameter, this.key, this.doc);

      const result = getProcessedResult(mergedInput, mergedParameter);

      return result != null
        ? result
        : this.translate(this.key);
    },

    processors
  );
};

function isParametrized(key: unknown): key is ParametrizedTranslationRecord {
  return typeof key === 'object' && key != null && 'processor' in key && 'parameter' in key && 'input' in key;
}

export type LocaleInputParameter<
  Locale extends Translation,
  K extends LocaleKey<Locale>,
  P extends Processors,
> = null | (
  Locale[K] extends { processor: infer O; input: infer I; }
    ? keyof O extends keyof P
      ? ExtraPartial<InputParameter<P, keyof O>>
      : ExtraPartial<I>
    : /* Locale[K] extends Array<Record<infer Key, any> | string>
      ? { [key in LocaleKey<Locale> & Key]?: LocaleInputParameter<Locale, key, P>; }
      : Locale[K] extends Record<infer Key, any>
        ? { [key in LocaleKey<Locale> & Key]?: LocaleInputParameter<Locale, key, P>; }
        :  */never
);

export type LocaleOptionsParameter<
  Locale extends Translation,
  K extends LocaleKey<Locale>,
  P extends Processors,
> = null | (
  Locale[K] extends { processor: infer O; parameter: infer I; }
    ? keyof O extends keyof P
      ? ExtraPartial<OptionsParameter<P, keyof O>>
      : ExtraPartial<I>
    : /* Locale[K] extends Record<string, any>
      ? { [key in LocaleKey<Locale> & keyof Locale[K]]?: LocaleOptionsParameter<Locale, key, P>; }
      :  */never
);
