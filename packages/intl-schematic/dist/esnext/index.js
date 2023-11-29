import { callPlugins } from './plugins/core';
export * from './ts.schema.d';
export const createTranslator = (getLocaleDocument, currentLocaleId, options = {}) => {
    const { processors = {}, plugins = [], } = options;
    const translate = function (key, input, parameter) {
        const doc = getLocaleDocument();
        const callHook = (hook, value, processor, _input = input) => callPluginsHook(hook, value, _input, parameter, currentLocaleId, key, doc, processor) ?? key;
        if (!doc) {
            return callHook('docNotFound');
        }
        const currentKey = doc[key];
        if (typeof currentKey === 'undefined') {
            return callHook('keyNotFound');
        }
        // Process a plain-string
        if (typeof currentKey !== 'object' && typeof currentKey !== 'function') {
            return currentKey ? callHook('keyProcessed', currentKey) : callHook('keyNotFound');
        }
        // Process a function record
        // TODO: move into a plugin
        if (typeof currentKey === 'function') {
            const inputContainsArgs = typeof input === 'object' && input && 'args' in input && Array.isArray(input.args);
            return callHook('keyProcessed', currentKey(...(inputContainsArgs ? input.args : [])));
        }
        return callHook('keyFound', currentKey);
    };
    const callPluginsHook = callPlugins(translate, plugins);
    callPluginsHook('initPlugin', processors, undefined, undefined, currentLocaleId, '', undefined, undefined);
    return translate;
};
