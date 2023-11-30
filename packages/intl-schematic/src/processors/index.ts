import type { TranslationModule } from '../ts.schema';

export type Processor = (locale: Intl.Locale) => (
  (parameter: any, key: string, document: TranslationModule) => (
    (input: any, overrideParameter?: any) => string
  )
);

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

const dateFormat = cachedIntl(Intl.DateTimeFormat, (date) => new Date(date));

class DisplayNames {
  private displayNames: Intl.DisplayNames;

  constructor(locale: Intl.LocalesArgument, options?: Intl.DisplayNamesOptions & { localeOverride: Intl.LocalesArgument }) {
    this.displayNames = new Intl.DisplayNames(options?.localeOverride ?? locale, options ?? { type: 'language' });
  }

  format(value: string): string {
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
  plural: (locale: Intl.Locale) => {
    const plurals = new Intl.PluralRules(locale.language);

    const plural = (variants: { [v in Intl.LDMLPluralRule]?: string }) => (
      (amount: number): string => (
        variants[plurals.select(amount)]
        ?? Object.values(variants)[0]
        ?? String(plurals.select(amount))
      )
    );

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
  dictionary: () => (options: Record<string, string>) => (input: { value: string, default: string; }) => {
    try {
      return (options && input.value in options) ? options[input.value] : input.default;
    } catch (error) {
      console.error(error);

      return input.default;
    }
  },

  display: cachedIntl(DisplayNames, x => x),
} satisfies Processors;

export type Processors = Record<string, Processor>;

export type InputParameter<
  P extends Processors,
  O extends keyof P
> = Parameters<ReturnType<ReturnType<P[O]>>>[0];

export type OptionsParameter<
  P extends Processors,
  O extends keyof P
> = Parameters<ReturnType<P[O]>>[0];
