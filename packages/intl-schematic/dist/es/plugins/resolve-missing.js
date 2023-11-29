import { createPlugin } from './core';
export const ResolveMissingKeyPlugin = new Proxy(createPlugin({ name: 'ResolveMissingKey' }), {
    get: (t, k) => (k === 'name'
        ? t.name
        : (value, input, ___, _, key) => (typeof value === 'string'
            ? value
            : (typeof input === 'string' ? input : key))),
});
