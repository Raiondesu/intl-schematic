import { LocalePlugin } from './locale';
import { ArraysPlugin } from './arrays';
import { ProcessorsPlugin } from './processors/plugin';
export const defaultPlugins = (currentLocale, processors) => [
    LocalePlugin(currentLocale),
    ArraysPlugin,
    ProcessorsPlugin(processors),
];
