import { Either } from './plugin-core';

type ObjectInput = Either<{
  /** Displayed when the key is not found
   * @alias default
   */
  fallback?: string | number;
}, {
  /** Displayed when the key is not found
   * @alias fallback
   * @deprecated use `fallback`
  */
  default?: string | number;
}> & Either<{
  /**
   * A key to find in the dictionary
   *
   * @alias key
   * @deprecated use `key`
  */
  value: string | number;
}, {
  /**
   * A key to find in the dictionary
   *
   * @alias value
   */
  key: string | number;
}>;

/**
 * ```
 * {
 *  "variant": {
 *    "processor": { "dictionary": "" },
 *    "parameter": {
 *      "a": "Variant A",
 *      "b": "Variant B"
 *    },
 *    "input": { "fallback": "Choose a variant!" }
 *  }
 * }
 * ```
 * then:
 * ```js
 * t('variant', { key: 'a' }) // "Variant a"
 * t('variant', { key: null }) // "Choose a variant!"
 * ```
 */
export const dictionary = () => (options: Record<string | number, string> | string[], key: string) => (
  (input?: string | ObjectInput): string => {
    const _input = typeof input === 'string'
      ? { key: input, fallback: input }
      : {
        fallback: (input && (
          'default' in input ? input.default
          : 'fallback' in input ? input.fallback
          : undefined
        )) ?? key,
        key: (input && (
          'key' in input ? input.key
          : 'value' in input ? input.value
          : ''
        )) ?? ''
      };

    try {
      return options && _input.key in options ? options[_input.key as keyof typeof options & number] : String(_input.fallback) ?? key;
    } catch (error) {
      return String(_input.fallback) ?? key;
    }
  }
);
