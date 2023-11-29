import { createPlugin } from './core';
export const ArrayRecordPlugin = createPlugin({
    name: 'ArrayRecord',
    keyFound(key, input, parameter) {
        // Process an array record (["Some text", "translation-key"])
        if (Array.isArray(key)) {
            const result = key.reduce((arr, refK) => {
                if (typeof refK !== 'string') {
                    const refParamK = Object.keys(refK)[0];
                    if (refParamK.startsWith('input:')) {
                        const key = refParamK.replace('input:', '');
                        const value = input?.[key];
                        return [
                            ...arr,
                            // TOOD: add a way to get a stringifier for a processors input
                            String(value)
                        ];
                    }
                    if (refK.__ignore) {
                        return arr;
                    }
                    return [...arr, this.translate(refParamK, input?.[refParamK], parameter?.[refParamK])];
                }
                if (!refK.startsWith('input:')) {
                    return [...arr, this.translate(refK, input?.[refK], parameter?.[refK])];
                }
                const _input = input;
                const inputKey = refK.replace('input:', '');
                return [...arr, _input[inputKey]];
            }, []).join(' ');
            return this.callHook('keyProcessed', result);
        }
    }
});
