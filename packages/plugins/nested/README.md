# `@intl-schematic/plugin-nested`<!-- omit from toc -->

Adds the ability to use nested keys in translation documents.

`npm i -s @intl-schematic/plugin-nested`

- [Basic usage](#basic-usage)
  - [Define a translation document factory](#define-a-translation-document-factory)
  - [Create a translator function (`t()`)](#create-a-translator-function-t)
  - [Use the translator function](#use-the-translator-function)
- [Dot-notation](#dot-notation)
- [JSON-schema](#json-schema)


## Basic usage

### Define a translation document factory

```ts
const getDocument = () => ({
  'hello': {
    'world': 'Hello, world!',
    'stranger': 'Hello, stranger!'
  },
  'foo': {
    'bar': {
      'baz': "Foo Bar Baz!"
    }
  }
});
```

### Create a translator function (`t()`)

```ts
import { createTranslator } from 'intl-schematic';
import { NestedKeysPlugin } from '@intl-schematic/plugin-nested';

// Notice the plugins array parameter
const t = createTranslator(getDocument, [NestedKeysPlugin]);
```

### Use the translator function

```ts
console.log(t('hello', 'world')); // `Hello, world!`
console.log(t('hello', 'stranger')); // `Hello, stranger!`
console.log(t('foo', 'bar', 'baz')); // `Foo Bar Baz!`

// Parameter auto-complete and type-checking!

// TS Error: Argument of type 'bar' is not assignable to parameter of type 'hello' | 'stranger'.
t('hello', 'bar');

// TS Error: Expected 2 arguments, but got 1.
t('hello');

// TS Error: Expected 3 arguments, but got 2.
t('foo', 'bar');
```

## Dot-notation

This plugin also allows to use dot-notation (`key.subkey`) with nested keys, but only through a workaround called `createDotNester`.

This is a wrapper for the main translator function, which adapts typing to nested keys separated by a dot:

```ts
import { createTranslator } from 'intl-schematic';
import { NestedKeysPlugin } from '@intl-schematic/plugin-nested';
import { createDotNester } from '@intl-schematic/plugin-nested/dot';

const getDocument = () => ({
  'hello': {
    'world': 'Hello, world!',
    'stranger': 'Hello, stranger!'
  },
  'foo': {
    'bar': {
      'baz': "Foo Bar Baz!"
    }
  },
  'regular': 'string key'
});

// Notice the plugins array parameter
const t = createTranslator(getDocument, [NestedKeysPlugin]);

const tn = createDotNester(t);

// `tn()` accepts dot-notated keys with type-hints:
tn('hello.world'); // 'Hello, world!'

// Still accepts regular string keys
tn('regular');
```

## JSON-schema

To use this plugins' property json schema, simply follow [this instruction](/packages/core/README.md#using-with-json-schema) and reference it using the unpkg link:
```
https://unpkg.com/@intl-schematic/plugin-nested/property.schema.json
```
