export interface IntlFormatter<T> {
  format(value: T): string;
  formatToParts?(value: T): unknown[];
}

type FormatFunction<Value, IntlOptions extends object> = {
  (value: string | Value, optionsOverride?: IntlOptions): string;
};

type ToPartsFormat<Formatter extends IntlFormatter<unknown>> = {
  toParts: Formatter['formatToParts'] extends undefined ? never : Formatter['formatToParts'];
};

export const cachedIntl: {
  <IntlOptions extends object, Value, Formatter extends IntlFormatter<Value>>(
    intl: new (locales?: string | string[], options?: IntlOptions) => Formatter,
    convert: (value: string) => Value,
    process?: {
      options?: (options: IntlOptions) => IntlOptions,
    },
  ): (locale: Intl.Locale) => (options: IntlOptions, key: string) => FormatFunction<Value, IntlOptions> & ToPartsFormat<Formatter>;

  <IntlOptions extends object, Value, Formatter extends IntlFormatter<Value>, CustomFormat extends FormatFunction<any, IntlOptions>>(
    intl: new (locales?: string | string[], options?: IntlOptions) => Formatter,
    convert: (value: string) => Value,
    process?: {
      options?: (options: IntlOptions) => IntlOptions,
      format?: (format: FormatFunction<Value, IntlOptions>, convert: (value: string) => Value) => CustomFormat,
    },
  ): (locale: Intl.Locale) => (options: IntlOptions, key: string) => CustomFormat & ToPartsFormat<Formatter>;
} = <IntlOptions extends object, Value, Formatter extends IntlFormatter<Value>, CustomFormat extends FormatFunction<any, IntlOptions>>(
  intl: new (locales?: string | string[], options?: IntlOptions) => Formatter,
  convert: (value: string) => Value,
  process?: {
    options?: (options: IntlOptions) => IntlOptions,
    format?: (format: FormatFunction<Value, IntlOptions>, convert: (value: string) => Value) => CustomFormat,
  },
) => {
  const cache: Record<string, Record<string, Formatter>> = {};
  const processOptions = process?.options;
  const processFormat = process?.format;

  return (locale: Intl.Locale) => {
    const localeCache = (cache[locale.baseName] ??= {});

    return (options: IntlOptions, key: string) => {
      let formatter = localeCache[key] ??= new intl(locale.language, processOptions?.(options) ?? options);

      const format = (value: string | Value, _options?: IntlOptions) => {
        if (_options) {
          const newOptions = { ...options, ..._options };
          const cacheKey = key + JSON.stringify(newOptions);
          formatter = localeCache[cacheKey] ??= new intl(locale.language, newOptions);
        };

        try {
          return formatter.format(
            typeof value === 'string'
            ? convert(value)
            : value
          );
        } catch {
          return String(value);
        }
      };

      const finalFormat = (processFormat?.(format, convert) ?? format) as typeof format & ToPartsFormat<Formatter>;

      finalFormat.toParts = formatter.formatToParts?.bind(formatter) as ToPartsFormat<Formatter>['toParts'];

      return finalFormat;
    };
  };
};
