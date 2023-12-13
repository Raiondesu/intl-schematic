import { createPlugin } from 'core';

declare module 'intl-schematic/core' {
  export interface Plugins {
    ArraysPlugin: [input: Record<string, unknown>, parameter: Record<string, unknown>];
  }
}

/**
 * Process an array record of this format:
 * `["Some text", "translation-key"]`
 *
 * Will find all translation keys referenced, resolve them
 * and join with all array elements by space.
 */
export const ArraysPlugin = createPlugin(
  'ArraysPlugin',

  function match(value): value is Array<string | object> {
    return Array.isArray(value);
  },

  function translate(input, parameter): string {
    return this.value.reduce<string[]>((arr, refK) => {
      if (typeof refK === 'string') {
        if (!refK.startsWith('input:')) {
          return [...arr, (this.plugins.ProcessorPlugin?.translate ?? this.translate)(
            refK,
            (input as Record<string, typeof input>)?.[refK],
            (parameter as Record<string, typeof parameter>)?.[refK]
          )];
        }

        const _input = input as Record<string, typeof input>;
        const inputKey = refK.replace('input:', '');

        return [...arr, _input[inputKey] as unknown as string];
      }

      const refParamK = Object.keys(refK)[0];

      if (refParamK.startsWith('input:')) {
        const key = refParamK.replace('input:', '');
        const value = (input as Record<string, typeof input>)?.[key];

        return [
          ...arr,
          // TOOD: add a way to get a stringifier for a processors input
          String(value)
        ];
      }

      if ('__ignore' in refK) {
        return arr;
      }

      return [...arr, (this.plugins.ProcessorPlugin?.translate ?? this.translate)(
        refParamK,
        (input as Record<string, typeof input>)?.[refParamK],
        (parameter as Record<string, typeof parameter>)?.[refParamK]
      )];
    }, []).join(' ');
  }
);

