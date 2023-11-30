import { cachedIntl } from './_cache';

/**
 * ```
 * {
 *  "translation-key": {
 *    "processor": { "number": "" },
 *    "parameter": { // Intl.NumberFormat options
 *      "style": "currency",
 *      "currency": "USD",
 *      "currencyDisplay": "symbol",
 *      "trailingZeroDisplay": "stripIfInteger"
 *    },
 *    "input": 0 // fallback
 *  }
 * }
 * ```
 * then:
 * ```js
 * t('translation-key', 123) // "$123"
 * ```
 */
export const numberFormat = cachedIntl(Intl.NumberFormat, Number);
