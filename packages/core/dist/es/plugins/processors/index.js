import { createPlugin } from '../core';
import { getLocalizedProcessors } from './plugin-core';
export const ProcessorsPlugin = (processors) => {
    const localizedProcessorsByLocale = {};
    return createPlugin('ProcessorsPlugin', function isParametrized(value) {
        if (typeof value !== 'object' || value == null) {
            return false;
        }
        const keys = Object.keys(value);
        const other = [];
        const processorKeys = keys.filter(k => k in processors ? true : (other.push(k), false));
        return processorKeys.length === 1 && other.every(k => k === 'input');
    }, {
        info: processors,
        translate(input, parameter) {
            var _a;
            const locale = this.plugins.Locale?.info();
            const localizedProcessors = (localizedProcessorsByLocale[_a = String(locale?.baseName)] ?? (localizedProcessorsByLocale[_a] = getLocalizedProcessors(processors, locale)));
            const processorName = 'processor' in this.value && typeof this.value.processor === 'object'
                ? Object.keys(this.value.processor)[0]
                : Object.keys(this.value)[0];
            const processor = localizedProcessors[processorName];
            if (!processor) {
                return undefined;
            }
            const inlineParameter = 'parameter' in this.value
                ? this.value.parameter
                : this.value[processorName];
            const mergedInput = this.value.input ? mergeInputs(this.value.input, input) : input;
            const mergedParameter = {
                ...inlineParameter,
                ...parameter,
            };
            const getProcessedResult = processor(mergedParameter, this.key, this.doc);
            const result = getProcessedResult(mergedInput, mergedParameter);
            return result ?? undefined;
        },
    });
};
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
export * from './plugin-core';
