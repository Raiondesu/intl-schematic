import { createPlugin } from 'intl-schematic/core';

declare module 'intl-schematic/core' {
  export interface Plugins {
    Locale: {
      args: [];
      info: () => Intl.Locale | undefined;
    };
  }
}

/**
 * Adds a locale property to the plugin context for later use,
 * intended to be only used as a locale container
 */
export const LocalePlugin = (currentLocale: () => Intl.Locale | undefined) => createPlugin(
  'Locale',

  // Always match
  (value): value is any => true,

  // Don't translate anything
  () => undefined,

  currentLocale
);
