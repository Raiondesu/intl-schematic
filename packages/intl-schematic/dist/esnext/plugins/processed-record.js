import { createPlugin } from './core';
import { mergeInputs } from './merge-inputs';
const localizedProcessorsByLocale = {};
let getLocalizedProcessors = () => ({});
export const ProcessorPlugin = createPlugin({
    name: 'Processor',
    initPlugin(processors) {
        getLocalizedProcessors = (currentLocaleId) => {
            const localeId = currentLocaleId();
            if (!localeId) {
                return {};
            }
            return Object.keys(processors).reduce((obj, key) => ({
                ...obj,
                [key]: processors[key](localeId),
            }), {});
        };
        return undefined;
    },
    keyFound(record, input, parameter, currentLocaleId, key, doc) {
        const localizedProcessors = (localizedProcessorsByLocale[String(currentLocaleId()?.baseName)] ??= getLocalizedProcessors(currentLocaleId));
        // Handle a processed record
        if (isParametrized(record)) {
            const processorName = Object.keys(record.processor)[0];
            const processor = localizedProcessors[processorName];
            if (!processor) {
                return this.callHook('processorNotFound', record);
            }
            // Delete undefined keys to make defaults bypass them in the spread later
            const mergedInput = mergeInputs(record.input, input);
            const mergedParameter = {
                ...record.parameter,
                ...parameter,
            };
            const getProcessedResult = processor(mergedParameter, key, doc);
            const result = getProcessedResult(mergedInput, mergedParameter);
            return result != null
                ? this.callHook('keyProcessed', result)
                : (this.callHook('keyNotProcessed', result) ?? this.callHook('keyNotFound', result));
        }
    }
});
function isParametrized(key) {
    return typeof key === 'object' && key != null && 'processor' in key && 'parameter' in key && 'input' in key;
}
