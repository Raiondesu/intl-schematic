# Table of contents<!-- omit from toc -->

- [Plugins API](#plugins-api)
  - [Definition](#definition)
    - [`name`](#name)
    - [`match`](#match)
    - [`info`](#info)
    - [`translate`](#translate)
      - [`this` context](#this-context)
        - [Context usage example](#context-usage-example)
      - [Using other plugins](#using-other-plugins)
  - [Advanced type-checking](#advanced-type-checking)
    - [`match` type-guards](#match-type-guards)
    - [`PluginRegistry`](#pluginregistry)
      - [Registry utility API](#registry-utility-api)


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

This property is exactly what enables [the locale plugin](/packages/plugins/locale/) to work.

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

> For the full type definition, see the [`PluginContext` type](/packages/core/src/plugins.ts#L58)
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

##### Context usage example

Example - a simple plugin that enables custom string interpolation:
```ts
// Document
const getDocument = () => ({
  key: '{0} interpolated value with {1} syntax{2}'
})
//

const InterpolationPlugin = createPlugin(
  'InterpolationPlugin',
  // Detect values with the pattern of `{some-number}`, like `{0}`
  (value): value is string => /{\d}/.test(value), {
  translate(...args) {
    return args.reduce(
      // Index of an argument corresponds with its position in the interpolated string
      (val, arg, index) => val.replace(`{${index}}`, arg),

      // Note: currently processed value from context,
      // equal to this.doc[this.key]
      this.value
    );
  }
});

const t = createTranslator(getDocument, [InterpolationPlugin]);

t('key', 'Is', 'custom', ' even possible?');
// Is interpolated value with custom syntax even possible?
t('key', 'Some cool', 'custom', '!');
// Some cool interpolated value with custom syntax!
```

#### Using other plugins

The context allows to use other plugins freely: get their information,
check if a value matches them, or even invoke their `translate` function given the right parameters.

The most straightforward example of how this can be useful is [the tiny locale plugin](/packages/plugins/locale/).

Normally, `intl-schematic` doesn't need to be directly aware of the user's locale,\
as it leaves determining the correct translation document to the developer
to supply in the [`getLocaleDocument`](/packages/core/src/index.ts#L23) parameter.\
But other plugins, such as [the processors plugin](/packages/plugins/processors/), may need the current user's locale
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

All of the features described above provide the functionality to the plugins,
making them work and allowing to extend the features of `intl-schematic` almost infinitely.\
However, this is not enough for typescript to provide helpful type-hints when using the library.

In order to help typescript infer as much information as possible about the plugins that are used for a specific key,
`intl-schematic` provides 2 main ways to define the needed types both declaratively and imperatively.

### `match` type-guards

The [`match`](#match) function is typed to require
having a [type predicate](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates)
in its return type, disallowing simple `boolean` values entirely.\
This is needed to enable compile-time type-matching for the keys,
which allows typescript to determine which plugin is the closest match for the specific key.

While the type predicate can match against something generic, like `Record<string, any>`,
it can also be used to require a very specific signature for the value to be matched against.

> See [the processors plugin](/packages/plugins/processors/src/index.ts#L51) match function for a comprehensive example.

In other words, the closer the `match` type predicate reflects
what the `match` function actually checks for, the easier it is for typescript
to correctly detect that the plugin is used for the specific key.

*Provider* plugins (like [the locale plugin](/packages/plugins/locale/)) usually set the `match` predicate
to `value is never` in order to not interfere with other plugins' type matching.

### `PluginRegistry`

If a plugin needs type-checking and auto-complete for its translation arguments to enable a smooth developer experience,
it can be registered in the [`PluginRegistry`](/packages/core/src/plugins.ts#L32) interface as a [`PluginRecord`](/packages/core/src/plugins.ts#L3).

In short, the `PluginRegistry` captures all registered plugins' definitions
to be placed in the context of the translator function invocation - `t('specific key')`,
where additional information can be provided to the plugin:
  - `LocaleDoc` - the current translation document;
  - `Key` - the key currently being translated (`specific key` in the example above);
  - `PluginInfo` - aggregator type, contains the `info` type of all matched plugins, can be used to infer the info for the specific plugin;
  - `ContextualPlugins` - a map of all plugins used in the `t()` invocation, allows to get other plugins'
    type information from the registry.

A plugin is registered using an ambient module declaration for `intl-schematic/plugins`

```ts
declare module 'intl-schematic/plugins' {
  export interface PluginRegistry<
    LocaleDoc, // Translation document
    Key, // Currently processed key
    PluginInfo, // Current plugin info
    ContextualPlugins // Map of all plugins, same as used in the `this` context
  > {
    PluginName: {
      args: unknown[];
      info?: unknown;
      signature?: unknown;
    }
  }
}
```

All plugins are registered by their `name` as the key in the interface, and an object value with the following properties:
  - `args`: a named tuple, directly used as a type for the `t()` function parameters after the key;
    - For example, if `args` is set to `[arg1: string, arg2?: number]`, then the `t()` call will have roughly this signature:
      `t(key: string, arg1: string, arg2?: number)`;
  - `info`: a context-defined plugin info, see [the locale plugin](/packages/plugins/locale/) for a simple example;
  - `signature`: any additional contextual information to display to the developer along with typehints for `t()`, the **plugin's signature**, if you will;
    - Might be useful for letting the developer know about some additional context for the currently selected key - information about other keys it references, for example, or its signature in the translation document.

For the `InterpolationPlugin` from the [context usage example](#context-usage-example),
a plugin registry record can look like this (very simplified "pseudocode" example):

```ts
declare module 'intl-schematic/plugins' {
  // The signature type parameters' names must match exactly to the original signature
  export interface PluginRegistry<
    LocaleDoc, // Translation document
    Key, // Currently processed key
    PluginInfo, // Current plugin info
    ContextualPlugins // Map of all plugins, same as used in the `this` context
  > {
    // Plugin's name must match the `name` property of the plugin exactly
    InterpolationPlugin: {
      // Here we extract the numbers in curly braces - `/{\d+}/` - from the value
      args: LocaleDoc[Key] extends infer Value
        ? Value extends `${string}{${number}}${string}`
          ? Value extends `${string}{${infer Indecies}}${string}`
            // and create a string tuple with the length corresponding to those numbers.
            ? (string[] & { length: Indecies })
            // If the amount isn't detected, simply give unlimited arguments
            : string[]
          : string[]
        // If the pattern isn't detected - simply allow anything,
        // because the plugin won't match anyway
        : unknown[];
    };
  }
}

// Now we have type hints
t('key', '0', '1', '2', '3') // TS Error: Expected 1-4 arguments, but got 5.
```

For a simple working example see [the nested plugin](/packages/plugins/nested/src/index.ts).\
For more advanced examples see [the processors plugin](/packages/plugins/processors/src/index.ts)
or [the arrays plugin](/packages/plugins/arrays/src/index.ts) - which automaticaly infers
referenced keys' plugin types using the `PluginRegistry`.

Notice how in all examples, all types in the `PluginRegistry` are written in-line, without wrapping them in helper/utility types or interfaces.\
This is done in order for typescript to correctly simplify the types before showing them to the developer, which makes type hints a lot more useful, as instead of displaying something like\
`type number is not assignable to type KeyParameterType<{ ... }, 'some key', { some: string }>`,\
it instead simply shows\
`type number is not assignable to type string`.

#### Registry utility API

When registering a plugin in the `PluginRegistry`, there might be a need
to quickly get information about other plugins or use some handy utility types.\
The `intl-schematic/plugins` module provides several utility types just for this:
- ```ts
  type GetPluginNameFromContext<LocaleDoc, Key, ContextualPlugins>
  ```
  - Allows to detect and get the plugin name for a specific key in the translation document;
- ```ts
  type KeysOfType<Object, ValueType>
  ```
  - Extracts from an object all keys that have values matching the `ValueType`,
    allows to detect any key that would yield `true` for a specific plugin's `match` function;
- ```ts
  type PluginInterface<LocaleDoc, Key, PluginName>
  ```
  - Constructs the interface for a plugin with name `PluginName` that would be used when processing the specific `Key`;
- ```ts
  type PluginRecord<Args, Info, Signature>
  ```
  - Mainly used to quickly infer some information about the plugin without rewriting its structure in the types.

These helper types do not need importing, as they are already accessible within the `intl-schematic/plugins` module declaration.
