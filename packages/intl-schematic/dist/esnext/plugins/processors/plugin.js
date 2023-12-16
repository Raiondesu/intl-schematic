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
    return createPlugin('ProcessorsPlugin', isParametrized, {
        info: processors,
        translate(input, parameter) {
            const locale = this.plugins.Locale?.info();
            const localizedProcessors = (localizedProcessorsByLocale[String(locale?.baseName)] ??= getLocalizedProcessors(processors, locale));
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
function isParametrized(value) {
    return typeof value === 'object' && value != null && 'processor' in value && 'parameter' in value && 'input' in value;
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
