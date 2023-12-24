# `@intl-schematic/cli` (WIP)

`npm i -D @intl-schematic/cli`

[`intl-schematic`](/packages/core/), as well as its plugins, defines a JSON-schema API designed specifically to allow type-checking JSON translation documents.

This CLI allows to quickly create such a schema based on the `intl-schematic` plugins you have currently installed.

### Using the CLI

To quickly define the `translation.schema.json` for your translation documents,
you can run the official [CLI](/packages/cli/) in your project's root:

```bash
npx intl-schematic init
# or provide an optional custom file name
npx intl-schematic init ./locales/my-translation.schema.json
```

And then use it in your translation document:

```json
// en.json
{
  // Path to the schema from the example above
  "$schema": "./translation.schema.json",
  "key": "Translation of my key"
}
```

```js
import translation from './en.json';

const t = createTranslator(() => translation);

// Etc., see example at the start of this file
```

> Note: the `$schema` key will be automatically excluded\
> from type hints for `t()` for your convenience!
