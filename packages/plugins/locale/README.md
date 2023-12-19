# `@intl-schematic/plugin-locale`

A provider-plugin, doesn't affect the translation process directly,
but allows other plugins to use a user-provided `Intl.Locale` instance,
using the [plugins API](../).

`npm i -s @intl-schematic/plugin-locale`

```ts
import { createTranslator } from 'intl-schematic';
import { LocaleProviderPlugin } from '@intl-schematic/plugin-locale';

const getUserLocale = () => new Intl.Locale(navigator.language);

// Notice the plugins array parameter
const t = createTranslator(getDocument, [
  LocaleProviderPlugin(getUserLocale),
  // ... all plugins supplied here
  // can now use `this.plugins.Locale.info()`
  // to access the user locale
]);
```

Then, in another plugin:

```ts
import { createPlugin } from 'intl-schematic/plugins';

// This import tells typescript that your plugin requires
// the locale plugin to work properly
import type {} from '@intl-schematic/plugin-locale';

const MyPlugin = createPlugin('MyPlugin', () => false, {
  translate() {
    const locale = this.plugins.Locale.info();

    // use the Intl.Locale
    console.log(locale.baseName);

    return 'my plugin translation';
  }
})
```
