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
 * intended to only be used as a locale container,
 * doesn't provide any translating on its own
 */
export const LocaleProviderPlugin = (currentLocale: () => Intl.Locale | undefined) => createPlugin(
  'Locale',
  // Never match (invisible plugin)
  (_): _ is never => false,
  { info: currentLocale }
);
