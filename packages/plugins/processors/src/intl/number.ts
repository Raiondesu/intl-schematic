import { cachedIntl } from './_cache';

/**
 * ```
 * {
 *  "translation-key": {
 *    "number": { // Intl.NumberFormat options
 *      "style": "currency",
 *      "currency": "USD",
 *      "currencyDisplay": "symbol",
 *      "trailingZeroDisplay": "stripIfInteger"
 *    }
 *  }
 * }
 * ```
 * then:
 * ```js
 * t('translation-key', 123) // "$123"
 * ```
 */
export const numberFormat = cachedIntl(Intl.NumberFormat, Number);
