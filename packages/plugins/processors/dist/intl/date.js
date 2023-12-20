// packages/plugins/processors/src/intl/_cache.ts
var cachedIntl = (intl, convert, process) => {
  const cache = {};
  const processOptions = process?.options;
  const processFormat = process?.format;
  return (locale) => {
    var _a;
    const localeCache = cache[_a = locale.baseName] ?? (cache[_a] = {});
    return (options, key) => {
      let formatter = localeCache[key] ?? (localeCache[key] = new intl(locale.language, processOptions?.(options) ?? options));
      const format = (value, _options) => {
        if (_options) {
          const newOptions = { ...options, ..._options };
          const cacheKey = key + JSON.stringify(newOptions);
          formatter = localeCache[cacheKey] ?? (localeCache[cacheKey] = new intl(locale.language, newOptions));
        }
        ;
        try {
          return formatter.format(
            typeof value === "string" ? convert(value) : value
          );
        } catch {
          return String(value);
        }
      };
      const finalFormat = processFormat?.(format, convert) ?? format;
      finalFormat.toParts = formatter.formatToParts?.bind(formatter);
      return finalFormat;
    };
  };
};

// packages/plugins/processors/src/intl/date.ts
var dateFormat = cachedIntl(Intl.DateTimeFormat, (date) => new Date(date));
export {
  dateFormat
};
