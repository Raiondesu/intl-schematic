/**
 * ```
 * {
 *  "translation-key": {
 *    "processor": { "dictionary": "" },
 *    "parameter": { // Intl.DateTimeFormat options
 *      "a": "Variant A",
 *      "b": "Variant B"
 *    },
 *    "input": { "default": "Choose a variant!" } // fallback
 *  }
 * }
 * ```
 * then:
 * ```js
 * t('translation-key', { value: 'a' }) // "Variant a"
 * t('translation-key', { value: null }) // "Choose a variant!"
 * ```
 */
export const dictionary = () => (options: Record<string, string>) => (input: { value: string, default: string; }) => {
  try {
    return (options && input.value in options) ? options[input.value] : input.default;
  } catch (error) {
    return input.default;
  }
};
