import { createPlugin } from './core';

declare module 'intl-schematic/plugins/core' {
  export interface PluginRegistry<Locale, Key> {
    Functions: {
      args: Locale[Key] extends (...args: infer Args) => string ? Args : [];
    };
  }
}

function match(value: unknown): value is (...args: any) => string {
  return typeof value === 'function';
};
/**
 * Process a functional record
 *
 * Will pass on the arguments from the t() function to the function found at the key
 * and output the string value
 */
export const FunctionsPlugin = createPlugin('Functions', match, {
  translate(...args) {
    return this.value(...args);
  }
});
