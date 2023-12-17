<h1 align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/Raiondesu/intl-schematic/main/logo/Dark%20Logo.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/Raiondesu/intl-schematic/main/logo/Light%20Logo.svg">
    <img alt="intl-schematic" src="https://raw.githubusercontent.com/Raiondesu/intl-schematic/main/logo/Light%20Logo.svg">
  </picture>
</h1>

<p align="center">

A tiny library (3kb, zero-dependency) that allows to localize and format strings while sparingly using the browser-standard [`Intl` API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl).

</p>

## Usage

Comprehensive documentation is in progress.

See a simplified example below and don't be afraid to take a look into the sources to find out more.

### Define a translation document

```js
const en = {
  "hello": "Hello, World!"
};
```

### Define a function that return a translation document

```js
const getDocument = () => en;
```

### Create a translator function (`t()`)

```js
import { createTranslator } from 'intl-schematic';

const t = createTranslator(getDocument);
```

### Use a translator function

```js
console.log(t('hello')); // `Hello, World!`
```

### Add default plugins and processors

These allow to use standard [Intl](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl) features,
like [`DateTimeFormat`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat),
[`PluralRules`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/PluralRules)
and [`DisplayNames`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DisplayNames).

```js
import { createTranslator } from 'intl-schematic';
import { defaultPlugins } from 'intl-schematic/plugins';
import { defaultProcessors } from 'intl-schematic/processors/default';

const getDocument = () => ({
  price: {
   processor: { number: "" },
   parameter: { // Intl.NumberFormat options
     style: "currency",
     currency: "USD",
     currencyDisplay: "symbol",
     trailingZeroDisplay: "stripIfInteger"
   },
   input: 0 // fallback
 }
});

const getLocale = () => new Intl.Locale('en');

const t = createTranslator(getDocument, defaultPlugins(
  getLocale
  defaultProcessors
));

console.log(t('price', 123)); // "US$123"
```
