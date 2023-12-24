# `@intl-schematic/react`

`npm i -s intl-schematic @intl-schematic/react`

## Basic usage

```tsx
import { createEffectTranslator } from '@intl-schematic/react';

const getDocument = (locale: Intl.Locale) => import(`/locales/${locale.baseName}.json`);

const userLocale = useRef(new Intl.Locale(navigator.language));

const createTranslator = createEffectTranslator(
  userLocale,
  (getLocale: () => Intl.Locale) => [/* Array of custom plugins */]
)

export default function Component() {
  const t = createTranslator(getDocument);

  // Fully reactive,
  // triggers automatic re-renders when the locale changes
  // or a new translation document is downloaded.
  const someText = useMemo(() => t('some key'));

  return <p>
    {/* Freely use in template as a plain string */}
    {someText()}
  </p>;
}
```
