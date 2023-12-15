import { createPlugin } from 'intl-schematic/core';
export const LocalePlugin = (currentLocale) => createPlugin('Locale', (value) => true, () => undefined, currentLocale);
