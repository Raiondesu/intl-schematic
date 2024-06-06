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
  // Asynchronous locale fetching, can contain (and will react to) reactive solid bindings
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

## JSX components

This library also provides some simple solid-js components which aim to help with wrapping parts of a translated string in html elements.

Going further let's assume that a file `my-locale.ts` containts something like this:
```ts
import { createTranslator } from 'intl-schematic';
import { ProcessorsPlugin, defaultProcessors } from '@intl-schematic/plugin-processors';

export const t = createTranslator(() => ({
  'my translation key': {
    dictionary: {
      'part one': 'intl-schematic',
      'part two': 'Stupidly simple, incredibly tiny, blazingly fast.'
    }
  }
}), [ProcessorsPlugin(defaultProcessors)]);
```


### Dictionary `Intl` component with slots

`Intl` is a simple component, it helps to wrap parts of the translated string in html elements.\
It assumes that the translation record is either a [dictionary](/packages/plugins/processors/README.md#processors) or a [nested record](/packages/plugins/nested/README.md), and allows to go one level deeper with the use of object children prop.

The component can be used in three different ways.

As a standalone component:

```tsx
import Intl from '@intl-schematic/solid/Intl';
import { t } from './my-locale';

export default function MyComponent() {
  return <>
    <Intl t={t} k="my translation key">
      {{
        'part one': str => <h1>{str}</h1>,
        'part two': str => <h2>{str}</h1>
      }}
    </Intl>
  </>;
}
```

As a generic component factory:
```tsx
import { useIntl } from '@intl-schematic/solid/Intl';
import { t } from './my-locale';

export default function MyComponent() {
  const Intl = useIntl(t);

  return <>
    <Intl k="my translation key">
      {{
        'part one': str => <h1>{str}</h1>,
        'part two': str => <h2>{str}</h1>
      }}
    </Intl>
  </>
}
```

As a component factory for a single translation key:

```tsx
import { useIntl } from '@intl-schematic/solid/Intl';
import { t } from './my-locale';

export default function MyComponent() {
  const Intl = useIntl(t, 'my translation key');

  return <>
    <Intl children={{
      'part one': str => <h1>{str}</h1>,
      'part two': str => <h2>{str}</h1>
    }} />
  </>;
}
```

### `Multiline` markup component

`Multiline` is a simple component, it helps to wrap separate lines of the translated string in html elements.\
It assumes that the translation record contains either `\n` or `\\n`, but still allows to customize the line splitting mechanism.\
Will wrap the lines in `<p>` with a custom class value, using the children prop will override this behavior.

The component can be used in four different ways.

As a standalone component with an optional custom line class:

```tsx
import Multiline from '@intl-schematic/solid/Multiline';
import { t } from './my-locale';

export default function MyComponent() {
  return <>
    <Multiline t={t} k="my translation key" class="m-0 text-lg" />
  </>;
}
```

As a standalone component with a custom line renderer:

```tsx
import Multiline from '@intl-schematic/solid/Multiline';
import { t } from './my-locale';

export default function MyComponent() {
  return <>
    <Multiline t={t} k="my translation key">
      {(line, lineNumber) => <p>{lineNumber()}: {line}</p>}
    </Multiline>
  </>;
}
```

As a generic component factory:
```tsx
import { useMultiline } from '@intl-schematic/solid/Multiline';
import { t } from './my-locale';

export default function MyComponent() {
  const Multiline = useMultiline(t);

  return <>
    <Multiline k="my translation key">
      {(line, lineNumber) => <p>{lineNumber()}: {line}</p>}
    </Multiline>
  </>
}
```

As a component factory for a single translation key:

```tsx
import { useMultiline } from '@intl-schematic/solid/Multiline';
import { t } from './my-locale';

export default function MyComponent() {
  const Multiline = useMultiline(t, 'my translation key');

  return <>
    <Multiline>
      {(line, lineNumber) => <p>{lineNumber()}: {line}</p>}
    </Multiline>
  </>;
}
```
