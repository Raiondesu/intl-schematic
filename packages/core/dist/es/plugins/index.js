import { LocaleProviderPlugin } from './locale';
import { ArraysPlugin } from './arrays';
import { ProcessorsPlugin } from './processors';
export const defaultPlugins = (currentLocale, processors, arraysDelimiter = ' ') => [
    LocaleProviderPlugin(currentLocale),
    ArraysPlugin(arraysDelimiter),
    ProcessorsPlugin(processors),
];
