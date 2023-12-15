import { createPlugin } from './core';
export const LocalePlugin = (currentLocale) => createPlugin('Locale', (_) => true, { info: currentLocale });
