<h1 align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./logo/Dark%20Logo.svg">
    <source media="(prefers-color-scheme: light)" srcset="./logo/Light%20Logo.svg">
    <img alt="intl-schematic" src="./logo/Light%20Logo.svg">
  </picture>
</h1>

<div align="center">

A tiny framework-agnostic i18n library (1-3kb, zero-dependency) that allows to localize and format strings while sparingly using the browser-standard [`Intl` API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl).

`npm i -s intl-schematic`

You can also install a nightly build [directly from github](#install-from-github)

For more usage examples, see the [main package readme](/packages/core/README.md)

[List of packages](#packages)

</div>

---

### Simple usage example

```ts
import { createTranslator } from 'intl-schematic';

// Define a translation document factory
const getDocument = () => ({
  "hello": "Hello, World!"
});

// Create a translator function (`t()`)
const t = createTranslator(getDocument);

// Use the translator function
console.log(t('hello')); // `Hello, World!`
```

## Features

- 🦺 **Full type-safety**: full autocomplete on translation keys, typed translation parameters and more;
- 🎄 **Tree-shakable**: only take what you need;
- 🔌 **Pluginable**: extend any processing step without limits - see the [plugins API](/packages/plugins/) for more;
- 📃 **JSON-validation using a [JSON-schema](/packages/core/README.md#using-with-json-schema)**: intellisense and popup hints right in the translation document;
- 🧵 **Dynamic strings with custom pre-processors**: write custom translation logic right in JSON;
- 📑 **Reference translation keys inside of other translation keys**: all with JSON-compatible syntax;
- 🚫 **No string-interpolation**: translation strings will never be processed or mangled by-default, so all unicode symbols are safe to use;
- 🌐 **Basic localized formatters**: declare formatting rules and translations in the same place.

## Why

I've grown frustrated with current implementations of popular l10n/i18n libraries, many of which:
- lack runtime JSON support,
- rely on custom-written localization and formatting logic (a lot of which is already implemented in `Intl`),
- are over-tailored to specific frameworks or SaaS solutions,
- force to define translation documents at compile/build-time or using a specific pipeline,
- lack support for modular translation documents or asynchronous/real-time localization,
- interpolate over translated strings - resulting in overreliance on custom string template syntax - different for each library,
- force a certain architecture on a project.

This library will try to avoid these common pitfalls, while retaining a small size and good performance.

## No-goals

This library will **not** support:
- **Translation key nesting using dot-notation**: needlessly complicates key lookup and maintenance, instead use namespaced keys or the [`nested` plugin](/packages/plugins/nested);
- **String interpolation**: while custom plugins and processors can do anything with the translated string,
the library by-itself does not and will not do any processing on the strings.

## Contributing

To contribute, create a branch and make a PR to `main`, or [create an issue](https://github.com/Raiondesu/intl-schematic/issues/new).

### Packages

This project utilizes a monorepo structure based on [npm workspaces](https://docs.npmjs.com/cli/v7/using-npm/workspaces/),\
with the main package being, of course, [`intl-schematic`](/packages/core/).

Full list of packages at the moment:
- [`intl-schematic`](/packages/core/) - main package
- [`@intl-schematic/solid`](/packages/solid/) - reactive adapter for [`solid-js`](https://www.solidjs.com)
- [`@intl-schematic/vue`](/packages/vue/) (WIP) - reactive adapter for [`vue`](https://vuejs.org)
- [Plugins](/packages/plugins/) - allow using custom formats in translation documents - not just strings:
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

- [`tsconfig`](/packages/tsconfig/) - typescript config used by the packages

### Local development

To develop locally, simply clone, and run the following in the root directory:
```
npm i -ws
```

The project uses TypeScript v5.3+

#### Build

Simply run
```
npm run build
```
to rebuild any changed packages.

### Install from github

In order to evaluate and test the newest version that is yet to be released on npm, simply install from github:

```
npm install 'https://gitpkg.now.sh/Raiondesu/intl-schematic/packages/core?main'
```

> ⚠ **Nightly builds are unstable and may be broken** ⚠
