# `@intl-schematic/solid`

A reactive [`solid-js`](https://www.solidjs.com) adapter for [`intl-schematic`](/packages/core/).

`npm i -s intl-schematic @intl-schematic/solid`

Creates a reactive [resource](https://www.solidjs.com/docs/latest/api#createresource)
with the locale document and user's locale
that is then passed in a closure to `intl-schematic` and user-defined plugins.

## Basic usage

```tsx
import { createLocaleResource } from '@intl-schematic/solid';

const getDocument = (locale: Intl.Locale) => import(`/locales/${locale.baseName}.json`);

const createTranslator = createLocaleResource(
  // Asynchronous locale fetching
  () => Promise.resolve(new Intl.Locale(navigator.language)),
  (getLocale: () => Intl.Locale) => [/* Array of custom plugins */]
)

export default function SolidComponent() {
  const t = createTranslator(getDocument);

  // Fully reactive,
  // automatically re-renders when the locale changes
  // or a new translation document is downloaded.
  return <p>{t('some translation key')}</p>;
}
```
