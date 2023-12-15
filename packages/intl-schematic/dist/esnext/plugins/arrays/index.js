import { createPlugin } from 'core';
export const ArraysPlugin = createPlugin('ArraysPlugin', function match(value) {
    return Array.isArray(value);
}, function translate(input, parameter) {
    return this.value.reduce((arr, refK) => {
        if (typeof refK === 'string') {
            if (!refK.startsWith('input:')) {
                const result = this.translate(refK, input?.[refK], parameter?.[refK]);
                if (typeof result === 'string') {
                    return [...arr, result];
                }
                return arr;
            }
            const inputKey = refK.replace('input:', '');
            return [...arr, String(input[inputKey])];
        }
        const refParamK = Object.keys(refK)[0];
        if (refParamK.startsWith('input:')) {
            const key = refParamK.replace('input:', '');
            const value = input?.[key];
            return [
                ...arr,
                String(value)
            ];
        }
        if ('__ignore' in refK) {
            return arr;
        }
        const result = this.translate(refParamK, input?.[refParamK], parameter?.[refParamK]);
        if (typeof result === 'string') {
            return [...arr, result];
        }
        return arr;
    }, []).join(' ');
});
