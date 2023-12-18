// packages/solid/src/index.ts
import { createResource } from "solid-js";
import { merge } from "rambda";
import { defaultPlugins } from "@intl-schematic/plugin-defaults";
import { createTranslator } from "intl-schematic";
function createLocaleResource(getLocale, processors) {
  return (localeImport) => {
    const [localeResource, { mutate }] = createResource(
      getLocale,
      (localePromise) => Promise.resolve(localePromise).then((loc) => Promise.all([localeImport(loc), loc])).then(([localeDoc, locale]) => {
        localeDoc.remote?.then((loc) => {
          if (loc) {
            mutate((prev) => merge(prev, loc));
          }
        });
        return [localeDoc.default, locale];
      })
    );
    const currentLocale = () => localeResource()?.[1] ?? new Intl.Locale(navigator.language);
    const currentDoc = () => localeResource()?.[0];
    return createTranslator(currentDoc, defaultPlugins(currentLocale, processors));
  };
}
export {
  createLocaleResource
};
