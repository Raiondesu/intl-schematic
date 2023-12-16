import { createPlugin } from './core';
export const LocaleProviderPlugin = (currentLocale) => createPlugin('Locale', (_) => false, { info: currentLocale });
