// packages/solid/src/index.ts
import { createResource } from "solid-js";
import { createTranslator } from "intl-schematic";
function createLocaleResource(getLocale, plugins) {
  return (localeImport) => {
    const [localeResource, { mutate }] = createResource(
      getLocale,
      (localePromise) => Promise.resolve(localePromise).then((loc) => Promise.all([localeImport(loc), loc])).then(([localeDoc, locale]) => {
        localeDoc.remote?.then((loc) => {
          if (loc) {
            mutate(([prev, prevLocale] = [localeDoc.default, locale]) => [{ ...prev, ...loc }, prevLocale]);
          }
        });
        return [localeDoc.default, locale];
      })
    );
    const currentLocale = () => localeResource.latest?.[1] ?? new Intl.Locale(navigator.language);
    const currentDoc = () => localeResource.latest?.[0];
    return createTranslator(currentDoc, plugins(currentLocale));
  };
}
export {
  createLocaleResource
};
