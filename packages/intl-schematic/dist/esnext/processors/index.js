export const cachedIntl = (intl, convert, process) => {
    const cache = new Map();
    const processOptions = process?.options;
    const processFormat = process?.format;
    return (locale) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const localeCache = cache.get(locale) ?? cache.set(locale, {}).get(locale);
        return (options, key) => {
            let formatter = localeCache[key] ??= new intl(locale.language, processOptions?.(options) ?? options);
            const format = (value, _options) => {
                if (_options) {
                    const newOptions = { ...options, ..._options };
                    const cacheKey = key + JSON.stringify(newOptions);
                    formatter = localeCache[cacheKey] ??= new intl(locale.language, newOptions);
                }
                ;
                try {
                    return formatter.format(typeof value === 'string'
                        ? convert(value)
                        : value);
                }
                catch {
                    return String(value);
                }
            };
            const finalFormat = (processFormat?.(format, convert) ?? format);
            finalFormat.toParts = formatter.formatToParts?.bind(formatter);
            return finalFormat;
        };
    };
};
const dateFormat = cachedIntl(Intl.DateTimeFormat, (date) => new Date(date));
class DisplayNames {
    displayNames;
    constructor(locale, options) {
        this.displayNames = new Intl.DisplayNames(options?.localeOverride ?? locale, options ?? { type: 'language' });
    }
    format(value) {
        return this.displayNames.of(value) ?? value;
    }
}
export const defaultProcessors = {
    // TODO: find a way to make typing for id fork
    id: () => () => x => x,
    string: () => () => String,
    /**
     * ```
     * {
     *  "translation-key": {
     *    "processor": { "date": "" },
     *    "parameter": { // Intl.DateTimeFormat options
     *      "day": "2-digit",
     *      "month": "2-digit",
     *      "year": "numeric"
     *    },
     *    "input": "" // fallback
     *  }
     * }
     * ```
     * then:
     * ```js
     * t('translation-key', new Date()) // "29.11.2023"
     * ```
     */
    date: dateFormat,
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
    number: cachedIntl(Intl.NumberFormat, Number),
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
    plural: (locale) => {
        const plurals = new Intl.PluralRules(locale.language);
        const plural = (variants) => ((amount) => (variants[plurals.select(amount)]
            ?? Object.values(variants)[0]
            ?? String(plurals.select(amount))));
        return plural;
    },
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
    dictionary: () => (options) => (input) => {
        try {
            return (options && input.value in options) ? options[input.value] : input.default;
        }
        catch (error) {
            console.error(error);
            return input.default;
        }
    },
    display: cachedIntl(DisplayNames, x => x),
};
