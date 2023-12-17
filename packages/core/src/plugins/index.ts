import { LocaleProviderPlugin } from './locale';
import { ArraysPlugin } from './arrays';
import { defaultProcessors } from './processors/default';
import { Processors, ProcessorsPlugin } from './processors';
import { Plugin } from 'intl-schematic/plugins/core';

/**
 * Default schematic plugins
 *
 * Allow to:
 * - Access a user's locale in other plugins
 * - Process translation keys with custom processors
 * - Join and cross-reference translation records using arrays and object
 */
export const defaultPlugins = <P extends Processors = typeof defaultProcessors>(
  currentLocale: () => Intl.Locale | undefined,
  processors: P,
  arraysDelimiter = ' '
) => [
  LocaleProviderPlugin(currentLocale),
  ArraysPlugin(arraysDelimiter),
  ProcessorsPlugin(processors),
] as const satisfies readonly Plugin[];
