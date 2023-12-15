import { createPlugin } from '../core';
const getLocalizedProcessors = (processors, locale) => {
    if (!locale) {
        return {};
    }
    return Object.keys((processors)).reduce((obj, key) => ({
        ...obj,
        [key]: (processors)[key](locale),
    }), {});
};
export const ProcessorsPlugin = (processors) => {
    const localizedProcessorsByLocale = {};
    function match(value) {
        return isParametrized(value);
    }
    ;
    return createPlugin('ProcessorsPlugin', match, {
        info: processors,
        translate(input, parameter) {
            var _a;
            const locale = this.plugins.Locale?.info();
            const localizedProcessors = (localizedProcessorsByLocale[_a = String(locale?.baseName)] ?? (localizedProcessorsByLocale[_a] = getLocalizedProcessors(processors, locale)));
            const processorName = Object.keys(this.value.processor)[0];
            const processor = localizedProcessors[processorName];
            if (!processor) {
                return undefined;
            }
            const mergedInput = mergeInputs(this.value.input, input);
            const mergedParameter = {
                ...this.value.parameter,
                ...parameter,
            };
            const getProcessedResult = processor(mergedParameter, this.key, this.doc);
            const result = getProcessedResult(mergedInput, mergedParameter);
            return result ?? undefined;
        },
    });
};
function isParametrized(key) {
    return typeof key === 'object' && key != null && 'processor' in key && 'parameter' in key && 'input' in key;
}
function mergeInputs(baseInput, input) {
    if (typeof input === 'object' && input != null) {
        for (const prop in input)
            if (input[prop] == null) {
                delete input[prop];
            }
    }
    const mergedInput = typeof baseInput === 'object' && typeof input === 'object'
        ? { ...baseInput, ...input }
        : (input ?? baseInput);
    return mergedInput;
}
