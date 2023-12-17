import { cachedIntl } from './_cache';

/**
 * ```
 * {
 *  "translation-key": {
 *    "date": { // Intl.DateTimeFormat options
 *      "day": "2-digit",
 *      "month": "2-digit",
 *      "year": "numeric"
 *    }
 *  }
 * }
 * ```
 * then:
 * ```js
 * t('translation-key', new Date()) // "29.11.2023"
 * ```
 */
export const dateFormat = cachedIntl(Intl.DateTimeFormat, (date) => new Date(date));
