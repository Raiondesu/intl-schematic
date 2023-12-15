import { createPlugin } from 'core';
export const FunctionsPlugin = createPlugin('Functions', function match(value) {
    return typeof value === 'function';
}, function translate(...args) {
    return this.value(...args);
});
