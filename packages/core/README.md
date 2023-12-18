<h1 align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/Raiondesu/intl-schematic/main/logo/Dark%20Logo.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/Raiondesu/intl-schematic/main/logo/Light%20Logo.svg">
    <img alt="intl-schematic" src="https://raw.githubusercontent.com/Raiondesu/intl-schematic/main/logo/Light%20Logo.svg">
  </picture>
</h1>

<p align="center">

A tiny library (3kb, zero-dependency) that allows to localize and format strings with infinitely expandable functionality.

</p>

- 🦺 **Full type-safety**: full autocomplete on translation keys, typed translation parameters and more;
- 🎄 **Tree-shakable**: only take what you need;
- 🔌 **Pluginable**: extend any processing step without limits;
- 📃 **JSON-validation using a JSON-schema**: intellisense and popup hints right in the translation document;
- 🚫 **No string-interpolation**: translation strings will never be processed or mangled by-default, so all unicode symbols are safe to use;

- [Define a translation document](#define-a-translation-document)
- [Define a function that returns a translation document](#define-a-function-that-returns-a-translation-document)
- [Create a translator function (`t()`)](#create-a-translator-function-t)
- [Use a translator function](#use-a-translator-function)
- [Add default plugins and processors](#add-default-plugins-and-processors)

## Usage<!-- omit from toc -->

Comprehensive documentation is in progress.

See a simplified example below and don't be afraid to take a look into the sources to find out more.

### Define a translation document

```js
const en = {
  "hello": "Hello, World!"
};
```

### Define a function that returns a translation document

```js
const getDocument = () => en;
```

### Create a translator function (`t()`)

```js
import { createTranslator } from 'intl-schematic';

const t = createTranslator(getDocument);

// OR

const t = createTranslator(getDocument, [
  // Add optional plugins here
  // they will be applied to translations in corresponding order
]);
```

### Use a translator function

```js
console.log(t('hello')); // `Hello, World!`
```

### Add default plugins and processors

Plugins allow to infinitely expand the functionality of `intl-schematic`. To find out more, see the main [plugins readme](../plugins/).

You might want to install [the default plugin collection](../plugins/defaults/):

`npm i @intl-schematic/plugin-defaults`

These allow to use standard [Intl](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl) features,
like [`DateTimeFormat`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat),
[`PluralRules`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/PluralRules)
and [`DisplayNames`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DisplayNames),
as well as cross-reference keys and many other features.

```js
import { createTranslator } from 'intl-schematic';
import { defaultPlugins, defaultProcessors } from '@intl-schematic/plugin-defaults';

const getDocument = () => ({
  price: {
    // Processor name - number - means process with Intl.NumberFormat
    number: {
      // Intl.NumberFormat options
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
