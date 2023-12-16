import { createPlugin } from '../core';

import { TranslationDocuemnt } from '../../ts.schema';

export type Processor<HandlesType = any, Parameter = any> = (locale: Intl.Locale) => (
  (parameter: Parameter, key: string, document: TranslationDocuemnt) => (
    (input: HandlesType, overrideParameter?: Parameter) => string | undefined
  )
);

export type Processors<HandleTypes = any> = Record<string, Processor<HandleTypes>>;

declare module 'intl-schematic/plugins/core' {
  export interface PluginRegistry<Locale, Key, PluginInfo> {
    ProcessorsPlugin: {
      // Any attempt to externalize these types leads to a rat race between a type simplifier and a type inferer
      args: PluginInfo extends Processors
        ? [
          input: {
              [key in Extract<keyof PluginInfo, keyof Locale[Key]['processor']>]:
                PluginInfo[key] extends Processor<infer HT> ? HT : never;
            }[Extract<keyof PluginInfo, keyof Locale[Key]['processor']>],

          parameter?: {
              [key in Extract<keyof PluginInfo, keyof Locale[Key]['processor']>]:
                PluginInfo[key] extends Processor<any, infer Param> ? Param : never;
            }[Extract<keyof PluginInfo, keyof Locale[Key]['processor']>],
        ]
        : [input?: unknown, parameter?: unknown];
      info: Processors;

      // Extracts a processor and a parameter from a translation key to display
      signature: {
        [subkey in keyof Omit<Locale[Key], 'input'>]:
          | subkey extends 'processor' ? keyof Locale[Key]['processor']
          : subkey extends 'parameter' ? Locale[Key][subkey]
          : never
      };
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

  return createPlugin('ProcessorsPlugin', isParametrized, {
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

function isParametrized(value: unknown): value is ParametrizedTranslationRecord {
  return typeof value === 'object' && value != null && 'processor' in value && 'parameter' in value && 'input' in value;
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
/**
 * The input arguments to a translation function in the format of 'name': 'default-value'. Provide a default value for each key.
 */
export type InputObject =
  | {
      /**
       * A key in the input object, value is used as a default
       *
       * This interface was referenced by `undefined`'s JSON-Schema definition
       * via the `patternProperty` "^.*$".
       */
      [k: string]:
        | unknown[]
        | boolean
        | number
        | null
        | {
            [k: string]: unknown;
          }
        | string;
    }
  | string
  | number
  | boolean
  | null;

/**
 * Parameter to pass into the processor function before passing in the input
 */
export type ParameterObject =
  | (
      | unknown[]
      | boolean
      | number
      | null
      | number
      | {
          [k: string]: unknown;
        }
      | string
    )[]
  | {
      /**
       * A key-value in the parameter object
       *
       * This interface was referenced by `undefined`'s JSON-Schema definition
       * via the `patternProperty` "^.*$".
       */
      [k: string]:
        | unknown[]
        | boolean
        | number
        | null
        | {
            [k: string]: unknown;
          }
        | string;
    };

/**
 * Allows to apply different pre-set functions to the input value with an object parameter before returning a localized string
 */
export interface ParametrizedTranslationRecord {
  processor: { [key: string]: string };
  parameter: ParameterObject;
  input: InputObject;
}
