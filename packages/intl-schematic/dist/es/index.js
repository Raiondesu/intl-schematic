import { callPlugins } from './plugins/core';
export * from './ts.schema.d';
/**
 * Creates a translation function (commonly known as `t()` or `$t()`)
 *
 * @param getLocaleDocument should return a translation document
 * @param currentLocaleId should return a current Intl.Locale
 * @param options
 * @returns a tranlation function that accepts a key to look up in the translation document
 */
export const createTranslator = (getLocaleDocument, currentLocaleId, options = {}) => {
    const { processors = {}, plugins = [], } = options;
    const translate = function (key, input, parameter) {
        const doc = getLocaleDocument();
        const callHook = (hook, value, _input = input) => callPluginsHook(hook, value, _input, parameter, currentLocaleId, key, doc) ?? key;
        if (!doc) {
            return callHook('docNotFound');
        }
        const currentKey = doc[key];
        if (currentKey == null) {
            return callHook('keyNotFound', key);
        }
        // Process a plain-string
        if (typeof currentKey === 'string') {
            return callHook('keyProcessed', currentKey);
        }
        // Process a function record
        // TODO: move into a plugin
        if (typeof currentKey === 'function') {
            return callHook('keyProcessed', currentKey(...(Array.isArray(input) ? input : [])));
        }
        return callHook('keyFound', currentKey);
    };
    const callPluginsHook = callPlugins(translate, plugins);
    // Initialize plugins
    callPluginsHook('initPlugin', processors, undefined, undefined, currentLocaleId, '', undefined, undefined);
    return translate;
};
