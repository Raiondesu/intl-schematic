# Table of contents<!-- omit from toc -->

- [Plugins API](#plugins-api)
  - [Definition](#definition)
    - [`name`](#name)
    - [`match`](#match)
    - [`translate`](#translate)
      - [`this` context](#this-context)
      - [Using other plugins](#using-other-plugins)
    - [`info`](#info)
  - [Advanced type-checking](#advanced-type-checking)
    - [`match` type-guards](#match-type-guards)
    - [`PluginRegistry`](#pluginregistry)
    - [Generalizing translation types](#generalizing-translation-types)


# Plugins API

`intl-schematic` implements a comprehensive plugin system that allows to expand its functionality by hooking into the translator function.

All plugins are aware of each other at runtime and retain a mutable context to exchange information.

## Definition

A plugin is a simple object with the following properties:
- `name` - a **unique** (in the context of its usage) name for the plugin;
- `match(value)` - a method that defines if a currently processed key-value pair is suitable for the plugin
- `translate()` - a method that can return a string translated by the plugin
- `info` - any information that the plugin might need or provide to other plugins at runtime

Most plugins, however, should be created using the `createPlugin` function:
```ts
import { createPlugin } from 'intl-schematic/plugins';

const MyPlugin = createPlugin(
  // First parameter defines the name
  'MyPlugin',
  // Second parameter defines the match function
  (value): value is unknown => true,
  // Third parameter defines everything else
  {
    // Plugin info
    info: { myPlugin: "it's my plugin!" },

    // translate method
    translate(...args: unknown[]): string | undefined {
      // context-aware
      this.key
      this.value
      this.doc
      this.plugins

      return 'string' || undefined;
    }
  }
);
```

This function drastically simplifies type-checking and allows to define `name` and `match` without using object property names.

If any additional parameters are required for the plugin,
it can instead be defined as a function that calls `createPlugin` internally:

```ts
const MyPlugin = (customInfo: any) => createPlugin(
  'MyPlugin',
  (value): value is unknown => true,
  {
    // Plugin info now contains customInfo
    info: { myPlugin: "it's my plugin!", customInfo },

    translate(...args: unknown[]) {
      // Use customInfo in the translation function
      console.log(customInfo);
      // ... translation logic
    }
  }
);

const t = createTranslator(getDocument, [
  // Simply invoke the plugin as a function
  // and pass the needed parameters
  MyPlugin({ custom: 'my custom info' })
]);
```

### `name`

> `string`

Should be unique in the context of plugin usage.

However, two plugins with the same `name` *can* co-exist,\
they even can be used in the same translator function:
```ts
import { createTranslator } from 'intl-schematic';
import { createPlugin } from 'intl-schematic/plugins';

const Plugin1 = createPlugin('Plugin', () => true, { translate: () => '1' });
const Plugin2 = createPlugin('Plugin', () => true, { translate: () => '2' });

const t = createTranslator(() => ({ 'key': 'value' }), [
  Plugin1,
  Plugin2,
]);

// Will always return '1'
t('key'); // '1'
// because Plugin1 always matches to `true` before Plugin2 can be invoked
```

But when using the [plugin context](#this-context),
`Plugin2` will always override `Plugin1`, because they have the same name:
```ts
const Plugin3 = createPlugin('OtherPlugin', () => true, {
  translate() {
    // `Plugin` here is the name of both Plugin1 and Plugin2
    console.log(this.plugins.Plugin.translate());
    // => '2'
    // Because Plugin2 was registered later and now overrides Plugin1
  }
});
```

### `match`

> ```ts
> (value: unknown, key: string, document: Record<string, unknown>) => value is TypeMatch
> ```

A [type-guard](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates)
function that determines if the plugin should be applied to a certain `value`.

For now, only matching the value (not the key) is supported,
but both key and document are provided just in case.

If a specific type is provided in the type guard clause,
`intl-schematic` will recognize that the plugin is used
and type-check the translation function parameters accordingly.

See [advanced type checking](#advanced-type-checking) for details.

### `info`

> `unknown`

This property is exactly what enables [the locale plugin](./locale/) to work.

It allows plugins to provide any information at runtime to other plugins (as well as to itself),
via accessing the plugin by its name:
```ts
createPlugin('PluginName', match, {
  info: { some: 'info' },
  translate() {
    this.plugins.PluginName.info // { some: 'info' }
  }
});
```

See ["Using other plugins"](#using-other-plugins) for more details.

### `translate`

> ```ts
> function translate(this: PluginContext<TypeMatch>, ...args: unknown[]): string | undefined;
> ```

Allows to apply custom translation logic for the matched value (not the key, yet).

Can return either a string or `undefined`.\
If a string is returned, it is immediately assumed to be the result of custom translation logic,
and will be returned directly from the translator function.\
If `undefined` is returned, other matched plugins will be applied to the string

#### `this` context

> For the full type definition, see the [`PluginContext` type](../core/src/plugins.ts#L58)
> ```ts
> interface PluginContext<TypeMatch> {
>   // Current plugin's name
>   name: string;
>
>   // Currently requested key
>   key: string;
>
>   // Value found by the key,
>   // type-matched using the aforementioned `match` function
>   value: TypeMatch;
>
>   // The entire translation document
>   doc: Record<string, unknown>;
>
>   // Context-aware translator function,
>   // allows for recursive translations
>   translate(key: string, ...args: unknown[]): string;
>
>   // Collection of all used plugins mapped by their `name` property,
>   // all used plugins' `match`, `translate`, and `info`
>   // can all be accessed using this property
>   plugins: Record<string, PluginInterface>;
>
>   // Since the current plugin can be invoked on some level of recursive translation,
>   // it may be useful to know the original translation context
>   originalKey: string;
>   originalValue: unknown;
>   originalCallArgs: unknown[];
> }
> ```

This context allows plugins to exchange information
and invoke the translation function recursively on different keys.

For example, if a plugin knows it's matched value contains a reference to another key,
it can call `this.translate(referencedKey, ...neededArgs)`
to start the translation process for the referenced key and get a string to return.

> ⚠ This may trigger infinite recursive calls
> if a key ends up referencing itself, so be careful!

#### Using other plugins

The context allows to use other plugins freely: get their information,
check if a value matches them, or even invoke their `translate` function given the right parameters.

The most straightforward example of how this can be useful is [the tiny locale plugin](./locale/).

Normally, `intl-schematic` doesn't need to be directly aware of the user's locale,\
as it leaves determining the correct translation document to the developer
to supply in the [`getLocaleDocument`](../core/src/index.ts#L23) parameter.\
But other plugins, such as [the processors plugin](./processors/), may need the current user's locale
to properly tune their functionality.

Hence, the locale plugin can request this information from the user **once**
and then pass it along to any other plugins that might need it.\
If, instead of relying on the locale plugin for this, all plugins
that required the locale to function simply requested it from the user,
the plugins array would look like this:
```ts
const getLocale = () => new Intl.Locale(navigator.language);

const t = createTranslator(getDocument, [
  Plugin1(getLocale),
  Plugin2(getLocale),
  ProcessorsPlugin(getLocale, processors),
  // ... etc.
]);
```
Which is much less than ideal for developer experience.

Instead, the locale plugin effectively adds a second parameter
to the `createTranslator` function, that can now be freely used by all plugins
(in the exact same way as the value of `getDocument` parameter is available in the plugins' context via the `doc` property),
simplifying the plguins' usage and definitions:

```ts
const t = createTranslator(getDocument, [
  LocaleProviderPlugin(getLocale),
  // Now these plugins do not need to require the user to pass
  // `getLocale` to each of them separately,
  /// and can simply call
  // `this.plugins.Locale.info()`
  // internally
  Plugin1,
  Plugin2,
  ProcessorsPlugin(processors)
]);
```

## Advanced type-checking

### `match` type-guards

### `PluginRegistry`

### Generalizing translation types
