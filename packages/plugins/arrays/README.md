# `@intl-schematic/plugin-arrays`<!-- omit from toc -->

Allows to use arrays as values in translation documents, adds many features to `intl-schematic`:
- 💬 **Define complex translations**: use array elements as separate lines or join by a custom delimiter
- 📑 **Reference other keys**: combine and compose multiple keys to save space in the translation document
- ♻ **Reuse pluginable keys**: pass type-schecked parameters to referenced keys that use plugins
- ⚙ **Reuse parameters from referenced keys**: reference parameters of other referenced keys to display them directly

`npm i -s @intl-schematic/plugin-arrays`

## Usage

As an example of another key that uses a plugin, [`plugin-processors`](../processors/) will be used with default processors.

### Define a translation document factory

```ts
const getDocument = () => ({
  price: {
    'intl/number': {
      style: "currency",
      currency: "USD",
      currencyDisplay: "symbol",
      trailingZeroDisplay: "stripIfInteger"
    },

    input: 0 // fallback for user input
  },
  birthday: {
    'intl/date': {
      year: "numeric",
      month: "short",
      day: "2-digit"
    }
  },

  gift: [
    "Buy this birthday gift for"
    { "price": [0] }, // references the `price` key with fallback
    "until",
    { "birthday": [] } // references the `birthday` key
  ]
});
```

### Create a translator function (`t()`)

```ts
import { createTranslator } from 'intl-schematic';
import { ArraysPlugin } from '@intl-schematic/plugin-arrays';
import { ProcessorsPlugin } from '@intl-schematic/plugin-processors';
import { defaultProcessors } from '@intl-schematic/plugin-processors/default';

// Notice the plugins array parameter
const t = createTranslator(getDocument, [
  ArraysPlugin,
  // Here, we will use the default processors,
  // but it's also possible to create custom processors
  ProcessorsPlugin(defaultProcessors)
]);
```

### Use a translator function

```ts
console.log(t('gift', { price: [123], birthday: [new Date(2023, 7, 9)] }));
// Buy this birthday gift for $123 until Aug 9, 2023

// Optional processor config override
console.log(t('gift', { price: [123, { currency: 'EUR' }], birthday: [new Date(2023, 7, 9)] }));
// Buy this birthday gift for €123 until Aug 9, 2023


// Parameter auto-complete and type-checking!

// TS Error: Argument of type Date is not assignable to parameter of type {...}.
t('gift', new Date());

// TS Error: Argument of type {} is not assignable to parameter of type {...}.
//           Missing properties: 'birthday', 'gift'
t('gift', {  });

// TS Error: Argument of type Date is not assignable to parameter of type number.
t('gift', { price: [new Date(), { currency: 'EUR' }], birthday: [new Date(2023, 7, 9)] });

// TS Error: Expected 2 arguments, but got 1.
t('gift');
```
