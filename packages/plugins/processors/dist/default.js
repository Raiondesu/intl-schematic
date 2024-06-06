var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// packages/plugins/processors/src/dictionary.ts
var dictionary = () => (options, key) => (input) => {
  const _input = typeof input === "string" ? { key: input, fallback: input } : {
    fallback: (input && ("default" in input ? input.default : "fallback" in input ? input.fallback : void 0)) ?? key,
    key: (input && ("key" in input ? input.key : "value" in input ? input.value : "")) ?? ""
  };
  try {
    return options && _input.key in options ? options[_input.key] : String(_input.fallback) ?? key;
  } catch (error) {
    return String(_input.fallback) ?? key;
  }
};

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

// packages/plugins/processors/src/intl/display.ts
var DisplayNames = class {
  constructor(locale, options) {
    __publicField(this, "displayNames");
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
  "intl/display": displayNames,
  dictionary
};
export {
  cachedIntl,
  dateFormat,
  defaultProcessors,
  displayNames,
  numberFormat,
  pluralRules
};
