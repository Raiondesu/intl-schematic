import { createPlugin } from '../core';

declare module 'intl-schematic/plugins/core' {
  export interface PluginRegistry {
    ArraysPlugin: {
      args: [input: Record<string, unknown>, parameter: Record<string, unknown>];
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
 */
export const ArraysPlugin = createPlugin('ArraysPlugin', match, {
  translate(input, parameter) {
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

