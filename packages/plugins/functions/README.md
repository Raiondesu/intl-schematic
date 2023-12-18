# `@intl-schematic/plugin-functions`<!-- omit from toc -->

Adds the ability to use plain functions in translation documents.

`npm i -s @intl-schematic/plugin-functions`

### Define a translation document

```ts
const en = {
  "hello": (name: string) => `Hello, ${name}!`
};
```

### Define a function that return a translation document

```ts
const getDocument = () => en;
```

### Create a translator function (`t()`)

```ts
import { createTranslator } from 'intl-schematic';
import { FunctionsPlugin } from '@intl-schematic/plugin-functions';

// Notice the plugins array parameter
const t = createTranslator(getDocument, [FunctionsPlugin]);
```

### Use a translator function

```ts
console.log(t('hello', 'Bob')); // `Hello, Bob!`

// Parameter auto-complete and type-checking!

// TS Error: Argument of type 'number' is not assignable to parameter of type 'string'.
t('hello', 42);

// TS Error: Expected 2 arguments, but got 1.
t('hello');
```
