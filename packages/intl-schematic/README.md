# intl-schematic (WIP)

A tiny library (3kb, zero-dependency) that allows to localize and format strings while sparingly using the browser-standard [`Intl` API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl).

Key features include:
- **Full type-safety**: full autocomplete on translation keys, typed translation parameters and more;
- **Tree-shakable**: only take what you need;
- **Pluginable**: extend any processing step without limits;
- **JSON-validation using a JSON-schema**: intellisense and popup hints right in the translation document;
- **Dynamic strings with custom pre-processors**: write custom translation logic right in JSON;
- **Reference translation keys inside of other translation keys**: all with JSON-compatible syntax;
- **No string-interpolation**: translation strings will never be processed or mangled by-default, so all unicode symbols are safe to use;
- **Basic localized formatters**: declare formatting rules and translations in the same place.

## Why

I've grown frustrated with current implementations of popular l10n/i18n libraries, many of which:
- lack runtime JSON support,
- rely on custom-written localization logic (a lot of which is already implemented in `Intl`),
- are over-tailored to specific frameworks or SaaS solutions,
- lack support for modular translation documents or asynchronous/real-time localization,
- interpolate over translated strings - resulting in overreliance on custom string template syntax - different for each library,
- force a certain architecture on a project.

This library will try to avoid these common pitfalls, while retaining a small size and good performance.


## No-goals

This library will **not** support:
- **Translation key nesting**: needlessly complicates key lookup and maintenance, use namespaced keys instead;
- **String interpolation**: while custom processors can do anything with the translated string, the library by-itself does not and will not do any processing on the strings.

## Usage

Comprehensive documentation is in progress.

See a simple example below and don't be afraid to take a look into the sources to find out more.

### Define a translation document

```js
const en = {
  "hello": "Hello, World!",
  "hello-name": name => `Hello, ${name}!`
};
```

### Define functions that return a translation document and a locale

```js
const getDocument = () => en;

const getLocale = () => new Intl.Locale('en')
```

### Create a translator function (`t()`)

```js
import { createTranslator, defaultPlugins, defaultProcessors } from 'intl-schematic';

const t = createTranslator(getDocument, getLocale, {
  processors: defaultProcessors,
  plugins: defaultPlugins,
});
```

### Use a translator function

```js
console.log(t('hello')); // `Hello, World!`
console.log(t('hello-name', ['Bob'])); // `Hello, Bob!`
```
