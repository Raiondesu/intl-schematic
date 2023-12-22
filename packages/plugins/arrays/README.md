# `@intl-schematic/plugin-arrays`<!-- omit from toc -->

Allows to use arrays as values in translation documents, adds many features to `intl-schematic`:
- 🎈 **Incredibly lightweight**: just around 1kb for the whole package.
- 💬 **Define complex translations**: use array elements as separate lines or join by a custom delimiter;
- 📑 **Reference other keys**: combine and compose multiple keys to save space in the translation document;
- ♻ **Reuse pluginable keys**: pass type-schecked parameters to referenced keys that use plugins;
- ⚙ **Reuse parameters from referenced keys**: reference parameters of other referenced keys to display them directly;
- 📃 **JSON-validation using a [JSON-schema](/packages/core/README.md#using-with-json-schema)**: intellisense and popup hints right in the translation document;
- 🚫 **No string-interpolation**: translation strings will never be processed or mangled by-default, so all unicode symbols are safe to use;

`npm i -s @intl-schematic/plugin-arrays`

## Usage

As an example of another key that uses a plugin, [`plugin-processors`](/packages/plugins/processors/) will be used with default processors.

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

  'for price': [
    "for",
    { "price": [0] }, // references the `price` key with fallback
  ],

  'until birthday': [
    "until",
    { "birthday": [] } // references the `birthday` key
  ],

  gift: [
    "Buy this birthday gift",
    "for price",
    "until birthday"
  ],

  gifts: {
    'intl/plural': {
      one: 'gift',
      other: 'gifts',
      many: 'gifts',
    }
  },

  'gifts amount': [
    // Reference to the 0-th argument of `gifts`
    '0:gifts',
    // Reference to the `gifts` key
    { 'gifts': 0 }
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
  ArraysPlugin(' '/* you can pass any string as a default separator */),
  // Here, we will use the default processors,
  // but it's also possible to create custom processors
  ProcessorsPlugin(defaultProcessors)
]);
```

### Use the translator function

```ts
t('for price', {
  // Pass parameters for the key reference
  price: [123]
});
// for $123

t('gifts amount', {
  // Pass parameters for the key reference
  gifts: [41]
});
// 41 gift

t('gifts amount', {
  // Pass parameters for the key reference
  gifts: [42]
});
// 42 gifts

// Optional processor config override
t('for price', { price: [123, { currency: 'EUR' }] });
// for €123

// Custom separator
t('for price', { price: [123] }, ' - ');
// for - €123

// Deep key cross-reference
t('gift', {
  'for price': [{ price: [123] }],
  'until birthday': [{ birthday: [new Date(2023, 7, 9)] }]
})
// Buy this birthday gift for €123 until - Aug 9, 2023

// Custom separator strategy
t('gift', {
  'for price': [{ price: [123] }, ' just '],
  'until birthday': [{ birthday: new Date(2023, 7, 9) }, ' - ']
}, (lines) => lines.join('\n'));
// Buy this birthday gift
// for just €123
// until - Aug 9, 2023


// Parameter auto-complete and type-checking!

// TS Error: Argument of type Date is not assignable to parameter of type {...}.
t('gift', new Date());

// TS Error: Argument of type {} is not assignable to parameter of type {...}.
//           Missing properties: 'until birthday', 'for price'
t('gift', {  });

// TS Error: Argument of type Date is not assignable to parameter of type number.
t('for price', { price: [new Date(), { currency: 'EUR' }] });

// TS Error: Expected 2-3 arguments, but got 1.
t('gift');
```
