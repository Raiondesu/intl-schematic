import type { TranslationModule } from '../ts.schema';
export type Processor = (locale: Intl.Locale) => ((parameter: any, key: string, document: TranslationModule) => ((input: any, overrideParameter?: any) => string));
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
export declare const cachedIntl: {
    <IntlOptions extends object, Value, Formatter extends IntlFormatter<Value>>(intl: new (locales?: string | string[], options?: IntlOptions) => Formatter, convert: (value: string) => Value, process?: {
        options?: (options: IntlOptions) => IntlOptions;
    }): (locale: Intl.Locale) => (options: IntlOptions, key: string) => FormatFunction<Value, IntlOptions> & ToPartsFormat<Formatter>;
    <IntlOptions extends object, Value, Formatter extends IntlFormatter<Value>, CustomFormat extends FormatFunction<any, IntlOptions>>(intl: new (locales?: string | string[], options?: IntlOptions) => Formatter, convert: (value: string) => Value, process?: {
        options?: (options: IntlOptions) => IntlOptions;
        format?: (format: FormatFunction<Value, IntlOptions>, convert: (value: string) => Value) => CustomFormat;
    }): (locale: Intl.Locale) => (options: IntlOptions, key: string) => CustomFormat & ToPartsFormat<Formatter>;
};
declare class DisplayNames {
    private displayNames;
    constructor(locale: Intl.LocalesArgument, options?: Intl.DisplayNamesOptions & {
        localeOverride: Intl.LocalesArgument;
    });
    format(value: string): string;
}
export declare const defaultProcessors: {
    id: () => () => (x: any) => any;
    string: () => () => StringConstructor;
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
    date: (locale: Intl.Locale) => (options: Intl.DateTimeFormatOptions, key: string) => FormatFunction<Date, Intl.DateTimeFormatOptions> & ToPartsFormat<Intl.DateTimeFormat>;
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
    number: (locale: Intl.Locale) => (options: Intl.NumberFormatOptions, key: string) => FormatFunction<number, Intl.NumberFormatOptions> & ToPartsFormat<Intl.NumberFormat>;
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
    plural: (locale: Intl.Locale) => (variants: {
        zero?: string | undefined;
        one?: string | undefined;
        two?: string | undefined;
        few?: string | undefined;
        many?: string | undefined;
        other?: string | undefined;
    }) => (amount: number) => string;
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
    dictionary: () => (options: Record<string, string>) => (input: {
        value: string;
        default: string;
    }) => string;
    display: (locale: Intl.Locale) => (options: Intl.DisplayNamesOptions & {
        localeOverride: Intl.LocalesArgument;
    }, key: string) => FormatFunction<string, Intl.DisplayNamesOptions & {
        localeOverride: Intl.LocalesArgument;
    }> & ToPartsFormat<DisplayNames>;
};
export type Processors = Record<string, Processor>;
export type InputParameter<P extends Processors, O extends keyof P> = Parameters<ReturnType<ReturnType<P[O]>>>[0];
export type OptionsParameter<P extends Processors, O extends keyof P> = Parameters<ReturnType<P[O]>>[0];
export {};
//# sourceMappingURL=index.d.ts.map