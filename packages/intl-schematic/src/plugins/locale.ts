import { createPlugin } from './core';

declare module 'intl-schematic/plugins/core' {
  export interface PluginRegistry {
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
  (_): _ is any => true,
  { info: currentLocale }
);
