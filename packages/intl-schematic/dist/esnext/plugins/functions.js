import { createPlugin } from './core';
function match(value) {
    return typeof value === 'function';
}
;
export const FunctionsPlugin = createPlugin('Functions', match, {
    translate(...args) {
        return this.value(...args);
    }
});
