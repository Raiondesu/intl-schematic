// packages/plugins/processors/src/intl/_cache.ts
var cachedIntl = (intl, convert, process) => {
  const cache = {};
  const processOptions = process?.options;
  const processFormat = process?.format;
  return (locale) => {
    const localeCache = cache[locale.baseName] ??= {};
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

// packages/plugins/processors/src/intl/display.ts
var DisplayNames = class {
  displayNames;
  constructor(locale, options) {
    this.displayNames = new Intl.DisplayNames(options?.localeOverride ?? locale, options ?? { type: "language" });
  }
  format(value) {
    return this.displayNames.of(value) ?? value;
  }
};
var displayNames = cachedIntl(DisplayNames, (x) => x);

// packages/plugins/processors/src/intl/number.ts
var numberFormat = cachedIntl(Intl.NumberFormat, Number);

// packages/plugins/processors/src/intl/plural.ts
var pluralRules = (locale) => {
  const plurals = new Intl.PluralRules(locale.language);
  const plural = (variants) => (amount) => variants[plurals.select(amount)] ?? Object.values(variants)[0] ?? String(plurals.select(amount));
  return plural;
};

// packages/plugins/processors/src/default.ts
var defaultProcessors = {
  date: dateFormat,
  number: numberFormat,
  plural: pluralRules,
  display: displayNames,
  "intl/date": dateFormat,
  "intl/number": numberFormat,
  "intl/plural": pluralRules,
  "intl/display": displayNames
};
export {
  cachedIntl,
  dateFormat,
  defaultProcessors,
  displayNames,
  numberFormat,
  pluralRules
};
