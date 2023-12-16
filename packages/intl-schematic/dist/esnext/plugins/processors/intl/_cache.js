export const cachedIntl = (intl, convert, process) => {
    const cache = {};
    const processOptions = process?.options;
    const processFormat = process?.format;
    return (locale) => {
        const localeCache = (cache[locale.baseName] ??= {});
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
