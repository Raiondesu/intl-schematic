import { LocaleProviderPlugin } from './locale';
import { ArraysPlugin } from './arrays';
import { ProcessorsPlugin } from './processors/plugin';
export const defaultPlugins = (currentLocale, processors) => [
    LocaleProviderPlugin(currentLocale),
    ArraysPlugin,
    ProcessorsPlugin(processors),
];
