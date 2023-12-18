import { FlatType } from 'intl-schematic';
import { createPlugin } from 'intl-schematic/plugins';
import type {} from '@intl-schematic/plugin-locale';

import { InputObject, ParameterObject, Processor, Processors, getLocalizedProcessors } from './plugin-core';

declare module 'intl-schematic/plugins' {
  export interface PluginRegistry<Locale, Key, PluginInfo> {
    ProcessorsPlugin: {
      // Any attempt to externalize these types leads to a rat race between a type simplifier and a type inferer
      args: PluginInfo extends Processors
        ? 'processor' extends keyof Locale[Key]
          // legacy format
          ? { [key in keyof PluginInfo]: PluginInfo[key] extends Processor<infer Input, infer Param>
              ? [input: Input, parameter?: Param] : never;
            }[Extract<keyof PluginInfo, keyof Locale[Key]['processor']>]
          // new format
          : { [key in keyof PluginInfo]: PluginInfo[key] extends Processor<infer Input, infer Param>
              ? [input: Input, parameter?: Param] : never;
            }[Extract<keyof PluginInfo, keyof Locale[Key]>]
        : [input?: unknown, parameter?: unknown];

      info: Processors;

      // Extracts a processor and a parameter from a translation key to display
      signature: Locale[Key];
    };
  }
}

/**
 * This plugin enables usage of custom translation pocessors
 *
 * Depends on LocalePlugin
*
 * @param processors An array of processors to use.
 * A processor is defined as a function of the following format:
 * ```js
 * locale => processorOptions => userInput => "string"
 * ```
 *
 * All processors are lazily initialized on the first use of the plugin
 * (first use of the translation function)
 * and then cached per processor options per user locale
 */
export const ProcessorsPlugin = <P extends Processors>(processors: P) => {
  const localizedProcessorsByLocale: Record<string, Record<string, ReturnType<Processor>>> = {};

  return createPlugin('ProcessorsPlugin',
    function isParametrized(value: unknown): value is ParametrizedTranslationRecord<Extract<keyof P, string>> | LegacyParametrizedTranslationRecord {
      if (typeof value !== 'object' || value == null) {
        return false;
      }

      const keys = Object.keys(value);
      const other: string[] = [];
      const processorKeys = keys.filter(k => k in processors ? true : (other.push(k), false));

      return processorKeys.length === 1 && other.every(k => k === 'input');
    },
    {
      info: processors,

      translate(input: InputObject, parameter: ParameterObject) {
        const locale = this.plugins.Locale?.info();
        const localizedProcessors = (
          localizedProcessorsByLocale[String(locale?.baseName)] ??= getLocalizedProcessors(processors, locale)
        );

        const processorName = 'processor' in this.value && typeof this.value.processor === 'object'
          ? Object.keys(this.value.processor)[0]
          : Object.keys(this.value)[0];

        const processor = localizedProcessors[processorName];

        if (!processor) {
          return undefined;
        }

        const inlineParameter = 'parameter' in this.value
          ? this.value.parameter
          : this.value[processorName];

        const mergedInput = this.value.input ? mergeInputs(
          this.value.input,
          input
        ) : input;

        const mergedParameter = {
          ...inlineParameter,
          ...parameter,
        };

        const getProcessedResult = processor(mergedParameter, this.key, this.doc);

        const result = getProcessedResult(mergedInput, mergedParameter);

        return result ?? undefined;
      },
    }
  );
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

/**
 * Allows to apply different pre-set functions to the input value with an object parameter before returning a localized string
 */
export type ParametrizedTranslationRecord<PName extends keyof Processors> = FlatType<{
  [key in PName]: { [name in key]: ParameterObject; } & {
    [name in Exclude<PName, key>]?: never;
  }
}[PName]> & {
  input?: InputObject;
};

export type LegacyParametrizedTranslationRecord = {
  input: InputObject;
  parameter: ParameterObject;
  processor: Record<string, any>;
};

export * from './plugin-core';
