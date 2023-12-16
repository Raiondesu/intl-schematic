import { createPlugin } from '../core';
import { Processor } from '../processors';

declare module 'intl-schematic/plugins/core' {
  export interface PluginRegistry<Locale, Key, PluginInfo, ContextualPlugins> {
    ArraysPlugin: {
      // Any attempt to externalize these types leads to a rat race between a type simplifier and a type inferer
      args: [
        input: Locale[Key][number] extends Record<infer Keys, any> ? {
          [key in Extract<Keys, keyof Locale>]: {
            [key in Extract<keyof ContextualPlugins['ProcessorsPlugin']['info'], keyof Locale[key]['processor']>]:
              ContextualPlugins['ProcessorsPlugin']['info'][key] extends Processor<infer HT> ? HT : never;
          }[Extract<keyof ContextualPlugins['ProcessorsPlugin']['info'], keyof Locale[key]['processor']>]
        } : unknown,

        parameter?: Locale[Key][number] extends Record<infer Keys, any> ? {
          [key in Extract<Keys, keyof Locale>]: {
            [key in Extract<keyof ContextualPlugins['ProcessorsPlugin']['info'], keyof Locale[key]['processor']>]:
              ContextualPlugins['ProcessorsPlugin']['info'][key] extends Processor<any, infer Param> ? Param : never;
          }[Extract<keyof ContextualPlugins['ProcessorsPlugin']['info'], keyof Locale[key]['processor']>]
        } : unknown
      ];

      // Extracts reference keys from arrays and detects their processors
      signature: {
        [key in Extract<keyof Exclude<Locale[Key][number], string>, keyof Locale>]: {
          [subkey in keyof Omit<Locale[key], 'input' | 'parameter'>]:
            | subkey extends 'processor' ? keyof Locale[key]['processor']
            : never
        }
      }
    };
  }
}

function match(value: unknown): value is Array<string | object> {
  return Array.isArray(value);
}

/**
 * Process an array record of this format:
 * `["Some text", "translation-key"]`
 *
 * Will find all translation keys referenced, resolve them
 * and join with all array elements by space.
 *
 * Depends on the {@link ProcessorsPlugin}
 */
export const ArraysPlugin = createPlugin('ArraysPlugin', match, {
  translate(input: Record<string, unknown>, parameter?: Record<string, unknown>) {
    return this.value.reduce<string[]>((arr, refK) => {
      if (typeof refK === 'string') {
        if (!refK.startsWith('input:')) {
          const result = this.translate(
            refK,
            input?.[refK],
            parameter?.[refK]
          );

          if (typeof result === 'string') {
            return [...arr, result];
          }

          return arr;
        }

        const inputKey = refK.replace('input:', '');

        return [...arr, String(input[inputKey])];
      }

      const refParamK = Object.keys(refK)[0];

      if (refParamK.startsWith('input:')) {
        const key = refParamK.replace('input:', '');
        const value = input?.[key];

        return [
          ...arr,
          // TOOD: add a way to get a stringifier for a processors input
          String(value)
        ];
      }

      if ('__ignore' in refK) {
        return arr;
      }

      const result = this.translate(
        refParamK,
        input?.[refParamK],
        parameter?.[refParamK]
      );

      if (typeof result === 'string') {
        return [...arr, result];
      }

      return arr;
    }, []).join(' ');
  }
});

