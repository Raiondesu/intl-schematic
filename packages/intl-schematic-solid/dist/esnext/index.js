import { createResource } from 'solid-js';
import { merge } from 'rambda';
import { defaultProcessors } from 'intl-schematic/processors';
import { defaultPlugins } from 'intl-schematic/plugins';
import { createTranslator } from 'intl-schematic';
export const createLocaleResource = (getLocale, processors) => (localeImport) => {
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
    return createTranslator(() => localeResource.latest?.[0], () => localeResource.latest?.[1], {
        processors: processors ?? defaultProcessors,
        plugins: defaultPlugins,
    });
};
