# `@intl-schematic/plugin-nested`

Adds the ability to use nested keys in translation documents.

`npm i -s @intl-schematic/plugin-nested`

### Define a translation document

```ts
const en = {
  'hello': {
    'world': 'Hello, world!',
    'stranger': 'Hello, stranger!'
  },
  'foo': {
    'bar': {
      'baz': "Foo Bar Baz!"
    }
  }
};
```

### Define a function that return a translation document

```ts
const getDocument = () => en;
```

### Create a translator function (`t()`)

```ts
import { createTranslator } from 'intl-schematic';
import { NestedPlugin } from '@intl-schematic/plugin-nested';

// Notice the plugins array parameter
const t = createTranslator(getDocument, [NestedPlugin]);
```

### Use a translator function

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
