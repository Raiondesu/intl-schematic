import { cachedIntl } from './_cache';

class DisplayNames {
  private displayNames: Intl.DisplayNames;

  constructor(locale: Intl.LocalesArgument, options?: Intl.DisplayNamesOptions & { localeOverride: Intl.LocalesArgument }) {
    this.displayNames = new Intl.DisplayNames(options?.localeOverride ?? locale, options ?? { type: 'language' });
  }

  format(value: string): string {
    return this.displayNames.of(value) ?? value;
  }
}

/**
 * ```
 * {
 *  "translation-key": {
 *    "processor": { "display": "" },
 *    "parameter": { // Intl.DisplayNames options
 *      "type": "language",
 *      "languageDisplay": "standard",
 *      "style": "narrow"
 *    },
 *    "input": "" // fallback
 *  }
 * }
 * ```
 * then:
 * ```js
 * t('translation-key', 'en-AU') // "English (Australia)"
 * ```
 */
export const displayNames = cachedIntl(DisplayNames, x => x);
