import { LocaleKey } from 'intl-schematic';
import { createPlugin } from 'intl-schematic/plugins';

declare module 'intl-schematic/plugins' {
  export interface PluginRegistry<LocaleDoc, Key, PluginInfo, ContextualPlugins> {
    ArraysPlugin: {
      // Any attempt to externalize these types leads to a rat race between a type simplifier and a type inferer
      args: [
        references: keyof Exclude<LocaleDoc[Key][number], string> extends infer Keys
          ? Keys extends LocaleKey<LocaleDoc>
            ? {
              [key in Keys]:
                GetPluginNameFromContext<LocaleDoc, key, ContextualPlugins> extends infer PluginName
                  ? PluginName extends keyof PluginRegistry
                    ? PluginRegistry<LocaleDoc, key,
                        ContextualPlugins[PluginName]['info'],
                        ContextualPlugins
                      >[PluginName] extends PluginRecord<infer Args>
                        ? [] extends Args ? never : Args
                        : unknown
                    : unknown
                  : unknown;
            } : {
              // In case references for the key weren't recognized,
              // iterate show user all locale keys' parameter types as options
              [key in LocaleKey<LocaleDoc>]?:
                GetPluginNameFromContext<LocaleDoc, key, ContextualPlugins> extends infer PluginName
                  ? PluginName extends keyof PluginRegistry
                    ? PluginRegistry<LocaleDoc, key,
                        ContextualPlugins[PluginName]['info'],
                        ContextualPlugins
                      >[PluginName] extends PluginRecord<infer Args>
                        ? Args
                        : unknown
                    : unknown
                  : unknown;
            }
          : unknown,
        separator?: string | ((translatedArray: string[], defaultSeparator: string) => string),
      ];

      // Extracts referenced keys from arrays and detects their processors and signatures
      // to display them to the user
      signature: {
        [key in keyof Exclude<LocaleDoc[Key][number], string> & LocaleKey<LocaleDoc>]:
          GetPluginNameFromContext<LocaleDoc, key, ContextualPlugins> extends infer PluginName
            ? PluginName extends keyof PluginRegistry
              ? PluginRegistry<LocaleDoc, key,
                  ContextualPlugins[PluginName]['info'],
                  ContextualPlugins
                >[PluginName] extends PluginRecord<any, any, infer Signature>
                  ? [PluginName, Signature]
                  : PluginName
              : PluginName
            : LocaleDoc[key];
      };
    };
  }
}

function match(value: unknown): value is Array<string | Record<string, unknown>> {
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
 * and join all elements using a custom separator (space by-default).
 *
 * @param defaultSeparator a string to join the array elements by, default is space
 */
export const ArraysPlugin = (defaultSeparator = ' ') => createPlugin('ArraysPlugin', match, {
  translate(
    referenceParams: Record<string, unknown[]>,
    separator: string | ((arr: string[], dSeparator: string) => string) = defaultSeparator
  ) {
    const startsWithIndex = /^.*?:/;

    const processReference = (referencedKey: string): string[] => {
      if (startsWithIndex.test(referencedKey)) {
        const [argIndexName, inputKey] = referencedKey.split(':');
        const argIndex = isNaN(Number(argIndexName)) ? 0 : Number(argIndexName);
        const references = normalizeRefs(referenceParams, inputKey);

        return [String(references[argIndex])];
      }

      const result = referencedKey in referenceParams
        ? this.translate(
          referencedKey,
          ...normalizeRefs(referenceParams, referencedKey)
        )
        : this.translate(referencedKey);

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
        referenceParams[refParamK] = normalizeRefs(refK, refParamK);
      } else if (refParamK in refK) {
        const references = normalizeRefs(referenceParams, refParamK);

        const inlineParams = normalizeRefs(refK, refParamK);
        referenceParams[refParamK] = references
          .map((param, i) => {
            const inlineParam = inlineParams[i];

            return typeof param === 'object' && typeof inlineParam === 'object'
              ? { ...inlineParam, ...param }
              : (param ?? inlineParam);
          });
      }

      return [...arr, ...processReference(refParamK)];
    }, []);

    if (typeof separator === 'string') {
      return result.join(separator);
    }

    return separator(result, defaultSeparator);

    function normalizeRefs(referenceMap: Record<string, unknown>, referenceKey: string) {
      return Array.isArray(referenceMap[referenceKey])
        ? referenceMap[referenceKey] as unknown[]
        : [referenceMap[referenceKey]];
    }
  }
});

