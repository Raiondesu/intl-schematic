import { createPlugin } from 'core';

declare module 'intl-schematic/core' {
  export interface Plugins<Locale, Key> {
    Functions: {
      args: Locale[Key] extends (...args: infer Args) => string ? Args : [];
    };
  }
}

/**
 * Process a functional record
 *
 * Will pass on the arguments from the t() function to the function found at the key
 * and output the string value
 */
export const FunctionsPlugin = createPlugin(
  'Functions',

  function match(value): value is (...args: any) => string {
    return typeof value === 'function';
  },

  function translate(...args) {
    return this.value(...args);
  }
);
