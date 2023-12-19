# `@intl-schematic/plugin-processors`<!-- omit from toc -->

Adds the ability to use custom processors for records in translation documents.

Requires [`@intl-schematic/plugin-locale`](../locale/) to properly function!

`npm i -s @intl-schematic/plugin-processors @intl-schematic/plugin-locale`

- [Usage](#usage)
  - [Define a translation document factory](#define-a-translation-document-factory)
  - [Create a translator function (`t()`)](#create-a-translator-function-t)
  - [Use the translator function](#use-a-translator-function)
  - [Document record format](#document-record-format)
- [Processors](#processors)
- [Processor API](#processor-api)


## Usage

> ⚠⚠⚠\
> This plugin requires [`@intl-schematic/plugin-locale`](../locale/) to properly function!\
> It **can** work without the locale plugin (hence why it isn't included),\
> but in this case processors' results might be improperly cached.\
> It's up to you to decide if that's okay for your specific use-case.

### Define a translation document factory

```ts
const getDocument = () => ({
  price: {
    // Processor name - number - means "use Intl.NumberFormat"
    number: {
      // Intl.NumberFormat options
      style: "currency",
      currency: "USD",
      currencyDisplay: "symbol",
      trailingZeroDisplay: "stripIfInteger"
    },

    // OR use the full processor name for clarity
    'intl/number': {
      // Intl.NumberFormat options
      style: "currency",
      currency: "USD",
      currencyDisplay: "symbol",
      trailingZeroDisplay: "stripIfInteger"
    },

    input: 0 // fallback for user input
  },
  birthday: {
    // Simple processor name - date - means "use Intl.DateTimeFormat"
    date: {
      // Intl.DateTimeFormat options
      year: "numeric",
      month: "short",
      day: "2-digit"
    }
  }
});
```

### Create a translator function (`t()`)

```ts
import { createTranslator } from 'intl-schematic';
import { LocaleProviderPlugin } from '@intl-schematic/plugin-locale';
import { ProcessorsPlugin } from '@intl-schematic/plugin-processors';
import { defaultProcessors } from '@intl-schematic/plugin-processors/default';

// Notice the plugins array parameter
const t = createTranslator(getDocument, [
  // Requires the LocaleProviderPlugin to work properly
  LocaleProviderPlugin(() => new Intl.Locale(navigator.language)),

  // Here, we will use the default processors,
  // but it's also possible to create custom processors
  ProcessorsPlugin(defaultProcessors)
]);
```

### Use the translator function

```ts
console.log(t('birthday', new Date(1997, 7, 9))); // Aug 9, 1997

console.log(t('price', 123)); // US$123

// Optional intl format config override
console.log(t('price', 123, { currency: 'EUR' })); // €123


// Parameter auto-complete and type-checking!

// TS Error: Argument of type Date is not assignable to parameter of type number.
t('price', new Date());

// TS Error: Argument of type { lol: 'kek' } is not assignable to parameter of type Intl.NumberFormatOptions.
t('price', 42, { lol: 'kek' });

// TS Error: Expected 2 arguments, but got 1.
t('birthday');
```

### Document record format

In order to apply a processor to a specific key in a document,
its value must be in the following format:

```ts
interface ProcessedRecord {
  [processorName: string]: unknown; // Processor parameter here
  input: unknown; // This value will be used as a fallback parameter
}
```

## Processors

Full list processors included in the plugin:

- `intl/number` (**default**) - uses
[Intl.NumberFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat)
to format any number passed as a second argument to translator function;
  - example:
    ```ts
    const doc = {
      price: {
        // Full processor name for clarity
        'intl/number': {
          // Intl.NumberFormat options
          style: "currency",
          currency: "USD",
          currencyDisplay: "symbol",
          trailingZeroDisplay: "stripIfInteger"
        },

        input: 0 // fallback for user input
      },
    }
    ```

- `intl/date` (**default**) - same as `intl/number`, but uses
[Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat);
  - example:
    ```ts
    const doc = {
      birthday: {
        // Full processor name for clarity
        'intl/date': {
          // Intl.DateTimeFormat options
          year: "numeric",
          month: "short",
          day: "2-digit"
        }
      },
    }
    ```

- `intl/display` (**default**) - adapts the [`DisplayNames`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DisplayNames) formatter to the same interface, allowing easy translation of regions, languages, or currency names;
  - example:
    ```ts
    const doc = {
      language: {
        // Full processor name for clarity
        'intl/display': {
          // Intl.DisplayNames options
          type: "language",
          languageDisplay: "standard",
          style: "narrow"
        }
      },
    }
    ```

- `intl/plural` (**default**) - adapts the [`PluralRules`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/PluralRules) formatter to the same interface, accepts a map of the [`.select()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/PluralRules/select) method results (`few`, `many`, etc.) to the required translations, very small and simplistic;
  - example:
    ```ts
    const doc = {
      banana: {
        // Full processor name for clarity
        'intl/plural': {
          // a map of the select() method results to translations
          one: "банан",
          few: "банана",
          other: "бананов"
        }
      },
    }
    ```

- `dictionary` - allows to use the translation record as a dictionary, simplified variant of the [`nested` plugin](../nested/), but with a depth level of 1 and ability to define a fallback in case of a wrong key.
  - example:
    ```ts
    const doc = {
      variants: {
        dictionary: {
          a: "Variant A",
          b: "Varian B"
        },
        input: {
          fallback: "No variant chosen!"
        }
      },
    }
    ```

## Processor API

A processor is defined as a simple function of the following format:

```ts
const myProcessor = (locale: Intl.Locale) => (
  (parameter: ProcessorParameter, key: string, document: Record<string, unknown>) => (
    (input: ProcessorInput, parameterOverride?: ProcessorParameter): string => {
      return 'processed value'
    }
  )
)

type ProcessorParameter = /* A parameter for your processor, must be defined directly in the document */;
type ProcessorInput = /* A parameter for your processor, can be supplied by the user or defined in the document */;
```

The curriyng here is used to enable efficient caching of the results of the processing that might be needed between each subsequent invocation of the processor.

There are two main types that govern a processor's behavior:
- `ProcessorParameter`
  - must be directly defined in the translation document;\
    for `intl/number`, for example, it's `Intl.NumberFormatOptions`.
- `ProcessorInput`
  - can be supplied by the user when calling the translator function,\
    a fallback can be defined in the translation document\
    in case the user accidentally provides `undefined` or `null`

When defining a record in the translation document, simply use an objecto to define the value.
In this object both types can be supplied via different keys:
`ProcessorParameter` is supplied to the key with the name of the processor,
while `ProcessorInput` is supplied to the `input` key.

When invoking the translator function, these parameters switch importance,
as `ProcessorInput` is required as the second argument,
while `ProcessorParameter` can optionally be supplied as the third argument
to override the one defined in the document.

