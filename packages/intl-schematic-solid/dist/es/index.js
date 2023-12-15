import { createResource } from 'solid-js';
import { merge } from 'rambda';
import { defaultPlugins } from 'intl-schematic/plugins';
import { createTranslator } from 'intl-schematic';
export function createLocaleResource(getLocale, localeImport, processors) {
    const [localeResource, { mutate }] = createResource(getLocale, (localePromise) => Promise.resolve(localePromise)
        .then(loc => Promise.all([localeImport(loc), loc]))
        .then(([localeDoc, locale]) => {
        localeDoc.remote?.then(loc => {
            if (loc) {
                mutate((prev) => merge(prev, loc));
            }
        });
        return [localeDoc.default, locale];
    }));
    const currentLocale = () => localeResource.latest?.[1] ?? new Intl.Locale(navigator.language);
    const currentDoc = () => localeResource.latest?.[0] ?? {};
    return createTranslator(currentDoc, defaultPlugins(currentLocale, processors));
}
;
