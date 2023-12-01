<h1 align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./logo/Dark%20Logo.svg">
    <source media="(prefers-color-scheme: light)" srcset="./logo/Light%20Logo.svg">
    <img alt="intl-schematic" src="./logo/Light%20Logo.svg">
  </picture>
</h1>

<div align="center">

A tiny framework-agnostic i18n library (3kb, zero-dependency) that allows to localize and format strings while sparingly using the browser-standard [`Intl` API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl).

`npm i -s intl-schematic`

To read more, see the [main package reamde](./packages/intl-schematic/README.md)

> ⚠ This is an early work-in-progress public prototype, use with caution! ⚠\
> The fact that this library is used in one project on produciton, doesn't mean it will work flawlessly in yours!

</div>

---

## Features

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
