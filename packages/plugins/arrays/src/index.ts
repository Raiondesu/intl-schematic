import { LocaleKey } from 'intl-schematic';
import { createPlugin } from 'intl-schematic/plugins';

declare module 'intl-schematic/plugins' {
  export interface PluginRegistry<Locale, Key, PluginInfo, ContextualPlugins> {
    ArraysPlugin: {
      // Any attempt to externalize these types leads to a rat race between a type simplifier and a type inferer
      args: [
        references: keyof Exclude<Locale[Key][number], string> extends infer Keys
          ? Keys extends LocaleKey<Locale>
            ? {
              [key in Keys & LocaleKey<Locale>]:
                GetPluginNameFromContext<Locale, key, ContextualPlugins> extends infer PluginName
                  ? PluginName extends keyof PluginRegistry
                    ? PluginRegistry<Locale, key,
                        ContextualPlugins[PluginName]['info'],
                        ContextualPlugins
                      >[PluginName] extends PluginRecord<infer Args>
                        ? Args
                        : unknown
                    : unknown
                  : unknown;
            } : unknown
          : unknown,
        delimiter?: string | ((translatedArray: string[], defaultDelimiter: string) => string),
      ];

      // Extracts reference keys from arrays and detects their processors
      // to display them to the user
      signature: {
        [key in keyof Exclude<Locale[Key][number], string> & LocaleKey<Locale>]: [
          GetPluginNameFromContext<Locale, key, ContextualPlugins>,
          Locale[key]
        ];
      };
    };
  }
}

function match(value: unknown): value is Array<string | Record<string, unknown[]>> {
  return Array.isArray(value);
}

/**
 * Process an array record of this format:
 * `["Some text", { "translation-key": "" }]`
 *
 * If a referenced key matches with another plugin,
 * it's possible to reference a raw parameter for the plugin:
 * ```
 * // Will reference the parameter at index 0 passed into the translation function for this key
 * ["Some text", { "translation-key": "" }, "0:translation-key"]
 * ```
 *
 * Will find all translation keys referenced, resolve them
 * and join all elements using a custom delimiter (space by-default).
 *
 * @param defaultDelimiter a string to join the array elements by, default is space
 */
export const ArraysPlugin = (defaultDelimiter = ' ') => createPlugin('ArraysPlugin', match, {
  translate(
    referenceParams: Record<string, unknown[]>,
    delimiter: string | ((arr: string[], dDelimiter: string) => string) = defaultDelimiter
  ) {
    const startsWithIndex = /^\d+:/;

    const processReference = (referencedKey: string): string[] => {
      if (startsWithIndex.test(referencedKey)) {
        const [argIndexName, inputKey] = referencedKey.split(':');
        const argIndex = isNaN(Number(argIndexName)) ? 0 : Number(argIndexName);

        return [String(referenceParams[inputKey][argIndex])];
      }

      const result = this.translate(
        referencedKey,
        ...referenceParams[referencedKey]
      );

      if (typeof result === 'string') {
        return [result];
      }

      return [];
    }

    const result = this.value.reduce<string[]>((arr, refK) => {
      if (typeof refK === 'string') {
        return [...arr, ...processReference(refK)];
      }

      const refParamK = Object.keys(refK)[0];

      if (typeof referenceParams[refParamK] === 'undefined' && refParamK in refK) {
        referenceParams[refParamK] = refK[refParamK];
      } else if (refParamK in refK) {
        const inlineParams = refK[refParamK];
        referenceParams[refParamK] = referenceParams[refParamK]
          .map((param, i) => {
            const inlineParam = inlineParams[i];

            return typeof param === 'object' && typeof inlineParam === 'object'
              ? { ...inlineParam, ...param }
              : (param ?? inlineParam);
          });
      }

      return [...arr, ...processReference(refParamK)];
    }, []);

    if (typeof delimiter === 'string') {
      return result.join(delimiter);
    }

    return delimiter(result, defaultDelimiter);
  }
});

