# `@intl-schematic/plugin-defaults`

This is a collection of plugins that should be of use to most applications in need of being localized.

`npm i -s @intl-schematic/plugin-defaults`

## Included plugins

- [`@intl-schematic/plugin-arrays`](/packages/plugins/arrays/)
  - use plain functions directly in translation documents with type-checked parameters
- [`@intl-schematic/plugin-locale`](/packages/plugins/locale/)
  - provider plugin, allows other plugins to use the provided `Intl.Locale` instance
- [`@intl-schematic/plugin-processors`](/packages/plugins/processors/)
  - apply custom and default processors to format the user inputs

This package also exports everything from the included plugins.

### Usage

```ts
import { createTranslator } from 'intl-schematic';
import { defaultPlugins } from '@intl-schematic/plugin-defaults';

const getLocale = () => new Intl.Locale(navigator.language);

// Notice the plugins array parameter
const t = createTranslator(getDocument, defaultPlugins(getLocale));
```

Then use according to the instructions of included plugins.
