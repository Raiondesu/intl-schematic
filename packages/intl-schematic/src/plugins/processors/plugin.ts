import { createPlugin } from '../core';
import { TranslationModule } from 'schema';

import { InputObject, ParameterObject, ParametrizedTranslationRecord } from '../../translation.schema';
import { ExtraPartial, LocaleKey, Translation } from 'schema';

declare module 'intl-schematic/plugins/core' {
  export interface PluginRegistry<Locale, Key, PluginInfo> {
    ProcessorsPlugin: {
      args: PluginInfo extends Processors
        ? [
          input?: LocaleInputParameter<Locale, Key, PluginInfo>,
          parameter?: LocaleOptionsParameter<Locale, Key, PluginInfo>
        ]
        : [input?: unknown, parameter?: unknown];
      info: Processors;
    };
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
export const ProcessorsPlugin = <P extends Processors>(processors: P) => {
  const localizedProcessorsByLocale: Record<string, Record<string, ReturnType<Processor>>> = {};

  function match(value: unknown): value is ParametrizedTranslationRecord {
    return isParametrized(value);
  };

  return createPlugin('ProcessorsPlugin', match, {
    info: processors,

    translate(input: InputObject, parameter: ParameterObject) {
      const locale = this.plugins.Locale?.info();
      const localizedProcessors = (
        localizedProcessorsByLocale[String(locale?.baseName)] ??= getLocalizedProcessors(processors, locale)
      );

      const processorName = Object.keys(this.value.processor)[0];
      const processor = localizedProcessors[processorName];

      if (!processor) {
        return undefined;
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

      return result ?? undefined;
    },
  });
};

function isParametrized(key: unknown): key is ParametrizedTranslationRecord {
  return typeof key === 'object' && key != null && 'processor' in key && 'parameter' in key && 'input' in key;
}

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

export type Processor = (locale: Intl.Locale) => (
  (parameter: any, key: string, document: TranslationModule) => (
    (input: any, overrideParameter?: any) => string
  )
);

export type Processors = Record<string, Processor>;

export type InputParameter<
  P extends Processors,
  O extends keyof P
> = Parameters<ReturnType<ReturnType<P[O]>>>[0];

export type OptionsParameter<
  P extends Processors,
  O extends keyof P
> = Parameters<ReturnType<P[O]>>[0];
