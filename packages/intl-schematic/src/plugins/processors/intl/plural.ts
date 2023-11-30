/**
 * ```
 * {
 *  "translation-key": {
 *    "processor": { "plural": "" },
 *    "parameter": { // Intl.PluralRules options
 *      "one": "word",
 *      "many": "words"
 *    },
 *    "input": "" // fallback
 *  }
 * }
 * ```
 *
 * t('translation-key', 12) // "words"
 */
export const pluralRules = (locale: Intl.Locale) => {
  const plurals = new Intl.PluralRules(locale.language);

  const plural = (variants: { [v in Intl.LDMLPluralRule]?: string }) => (
    (amount: number): string => (
      variants[plurals.select(amount)]
      ?? Object.values(variants)[0]
      ?? String(plurals.select(amount))
    )
  );

  return plural;
};
