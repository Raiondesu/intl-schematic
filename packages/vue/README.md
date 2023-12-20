# `@intl-schematic/vue`

`npm i -s intl-schematic @intl-schematic/vue`

## Basic usage

```ts
import { createLocaleResource } from '@intl-schematic/vue';

const getDocument = (locale: Intl.Locale) => import(`/locales/${locale.baseName}.json`);

const userLocale = ref(new Intl.Locale(navigator.language));

const createTranslator = createLocaleResource(
  userLocale,
  (getLocale: () => Intl.Locale) => [/* Array of custom plugins */]
)

export default defineComponent(() => {
  const t = createTranslator(getDocument);

  // Fully reactive,
  // triggers automatic re-renders when the locale changes
  // or a new translation document is downloaded.
  const someText = computed(() => t('some key'));

  return {
    // Freely use in template as a plain string
    someText
  };
});
```
