<h1 align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/Raiondesu/intl-schematic/main/logo/Dark%20Logo.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/Raiondesu/intl-schematic/main/logo/Light%20Logo.svg">
    <img alt="intl-schematic" src="https://raw.githubusercontent.com/Raiondesu/intl-schematic/main/logo/Light%20Logo.svg">
  </picture>
</h1>

<p align="center">

A tiny framework-agnostic i18n library (1kb gzip, zero-dependency)
that allows to localize and format strings with infinitely expandable functionality.

</p>

- 🦺 **Full type-safety**: full autocomplete on translation keys, typed translation parameters and more;
- 🎄 **Tree-shakable**: only take what you need;
- 🧩 **Easily integrates with UI-frameworks**: we don't play favorites here - [every framework can use this](#using-with-reactive-frameworks);
- 🔌 **Pluginable**: extend any processing step without limits - see the [plugins API](/packages/plugins/) for more;
- 📃 **JSON-validation using a [JSON-schema](#using-with-json-schema)**: intellisense and popup hints right in the translation document;
- 🚫 **No string-interpolation**: translation strings will never be processed or mangled by-default, so all unicode symbols are safe to use;

## Table of contents<!-- omit from toc -->

- [Basic Usage](#basic-usage)
  - [Define a translation document factory](#define-a-translation-document-factory)
  - [Create a translator function (`t()`)](#create-a-translator-function-t)
  - [Use the translator function](#use-the-translator-function)
- [Using with reactive frameworks](#using-with-reactive-frameworks)
  - [Current framework integrations](#current-framework-integrations)
- [Plugins](#plugins)
  - [List](#list)
  - [Add default plugins and processors](#add-default-plugins-and-processors)
- [Using with JSON-schema](#using-with-json-schema)


## Basic Usage

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

## Using with reactive frameworks

Many other i18n libraries require deep integration into a specific UI-framework.\
This, however, is not the case with `intl-schematic`, due to its framework-agnostic and isomorphic architecture.

The only requirement to make it behave "natively" for a certain framework,
is to simply add a reactive dependency to a closure of `getLocaleDocument` function (the first argument of `createTranslator`).

Here's an example in a "reactive pseudocode":

```tsx
// Define a reactive variable;
// Solid
const userLocale = createSignal(new Intl.Locale('en'));
// Vue
const userLocale = ref(new Intl.Locale('en'));

const fetchDocument = () => {
  // Somehow get a value from the reactive variable
  const language = get(userLocale).language;
  // Suppose you have a translation document in the `locales` folder
  return import(`/locales/${language}.json`);
};

// Create a reactive variable for a translation document
const currentDocument = createSignal();

// Then, in a reactive context (like a UI component)
const t = createTranslator(
  // If this function is invoked in a reactive context,
  // the framework will most likely track this as a reactive dependency
  () => get(currentDocument)
);

// useEffect/watch/computed
createEffect(() => {
  // Since calling `fetchDocument`
  // involves getting a value from a reactive variable,
  // this is tracked as a reactive dependency and will re-run accordingly
  fetchDocument()
    .then(newDocument => set(currentDocument, newDocument));
});

<p>{t('some key')}</p> // Some text

// Then change the locale
set(userLocale, new Intl.Locale('es'));

// The text re-renders automatically once the new translation document is fetched
<p>{t('some key')}</p> // Algún texto
```

Even though something like this is fairly trivial to implement,
given a basic knowledge of any specific UI-framework,
`intl-schematic` still offers some "in-house"-made integrations:

### Current framework integrations

- [`@intl-schematic/solid`](/packages/solid/) - reactive adapter for [`solid-js`](https://www.solidjs.com)
  - Creates a reactive [resource](https://www.solidjs.com/docs/latest/api#createresource)
    with the locale document and user's locale
    that is then passed in a closure to `intl-schematic` and user-defined plugins
- [`@intl-schematic/vue`](/pacakges/vue/) - Work in progress

If you want an integration for your favorite framework, feel free to contibute or [create an issue](https://github.com/Raiondesu/intl-schematic/issues/new)!

## Plugins

This is by far the main strength of the library.

Translating keys relies on simple key-value lookup, and most i18n libraries
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

## Using with JSON-schema

`intl-schematic`, as well as its plugins, defines a JSON-schema API designed specifically to allow type-checking JSON translation documents.

To define a JSON-schema for your translation documents, simply create a `.schema.json` file with this template:
```json
// translation.schema.json
{
  "$ref": "./node_modules/intl-schematic/translation.schema.json",
  "additionalProperties": {
    "anyOf": [
      // Definition for the default string key-value pair
      {
        "$ref": "./node_modules/intl-schematic/property.schema.json",
      }
      // Add references to more allowed types for your schema
      /* for example, @intl-schematic/plugin-processors definition:
      {
        "$ref": "./node_modules/@intl-schematic/plugin-processors/property.schema.json"
      }
      */
    ]
  }
}
```

And then use it in your translation document:

```json
// en.json
{
  // Path to the schema from the example above
  "$schema": "./translation.schema.json",
  "key": "Translation"
}
```

```js
import translation from './en.json';

const t = createTranslator(() => translation);

// Etc., see example at the start of this file
```

> Note: the `$schema` key will be automatically excluded\
> from type hints for `t()` for your convenience!

### Plugins that define a `property.schema.json`

Not all plugins have a `property.schema.json` file, not all of them need to.\
Here's a list of the ones that do:
- [`@intl-schematic/plugin-arrays`](/packages/plugins/arrays/) (included in **defaults**)
  - use arrays to cross-reference keys and define complex multiline texts
- [`@intl-schematic/plugin-processors`](/packages/plugins/processors/) (included in **defaults**)
  - apply custom and default processors to format the user inputs
