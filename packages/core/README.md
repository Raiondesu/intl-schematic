<h1 align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/Raiondesu/intl-schematic/main/logo/Dark%20Logo.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/Raiondesu/intl-schematic/main/logo/Light%20Logo.svg">
    <img alt="intl-schematic" src="https://raw.githubusercontent.com/Raiondesu/intl-schematic/main/logo/Light%20Logo.svg">
  </picture>
</h1>

<p align="center">

A tiny library (1kb, zero-dependency) that allows to localize and format strings with infinitely expandable functionality.

</p>

- 🦺 **Full type-safety**: full autocomplete on translation keys, typed translation parameters and more;
- 🎄 **Tree-shakable**: only take what you need;
- 🔌 **Pluginable**: extend any processing step without limits - see the [plugins API](/packages/plugins/) for more;
- 📃 **JSON-validation using a JSON-schema**: intellisense and popup hints right in the translation document;
- 🚫 **No string-interpolation**: translation strings will never be processed or mangled by-default, so all unicode symbols are safe to use;

## Table of contents<!-- omit from toc -->

- [Define a translation document factory](#define-a-translation-document-factory)
- [Create a translator function (`t()`)](#create-a-translator-function-t)
- [Use the translator function](#use-the-translator-function)
- [Add default plugins and processors](#add-default-plugins-and-processors)

## Usage<!-- omit from toc -->

See a simplified example below and don't be afraid to take a look into the sources to find out more.

### Define a translation document factory

```js
// In the real world, this function would probably contain
// a dynamic import of the required translation document
const getDocument = () => ({
  "hello": "Hello, World!"
});
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

### Use the translator function

```js
console.log(t('hello')); // `Hello, World!`
```

## Plugins

This is by far the main strength of the library.

Translating keys relies on simple key-value lookup, and most libraries
add many unnecessary features on top of this primitive functionality.

`intl-schematic` instead provides a way to extend both its functionality and type definitions in a comprehensive enough way,
so that anyone can pick and choose what exact features are needed for their project without any bloat whatsoever.

In other words, plugins allow to almost infinitely expand the functionality of `intl-schematic`.

To find out more, see the main [plugins readme](/packages/plugins/).

### List

Current list of all official plugins is as follows:
- [`@intl-schematic/plugin-defaults`](/packages/plugins/defaults/)
  - recommended collection of plugins that should be useful to most applications
- [`@intl-schematic/plugin-arrays`](/packages/plugins/arrays/) (included in **defaults**)
  - use arrays to cross-reference keys and define complex multiline texts
- [`@intl-schematic/plugin-functions`](/packages/plugins/functions/)
  - use plain functions directly in translation documents with type-checked parameters
- [`@intl-schematic/plugin-locale`](/packages/plugins/locale/) (included in **defaults**)
  - provider plugin, allows other plugins to use the provided `Intl.Locale` instance
- [`@intl-schematic/plugin-nested`](/packages/plugins/nested/)
  - access nested keys in deep multi-level objects
- [`@intl-schematic/plugin-processors`](/packages/plugins/processors/) (included in **defaults**)
  - apply custom and default processors to format the user inputs

### Add default plugins and processors

You might want to install [the default plugin collection](/packages/plugins/defaults/):

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
  getLocale,
  defaultProcessors
));

console.log(t('price', 123)); // "$123"
```
