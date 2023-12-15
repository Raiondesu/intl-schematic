import { LocalePlugin } from './locale';
import { ArraysPlugin } from './arrays';
import { Processors, ProcessorsPlugin } from './processors/plugin';
import { defaultProcessors } from './processors';

/**
 * Default schematic plugins
 *
 * Allow to:
 * - Process translation keys with custom processors
 * - Join and cross-reference translation records using arrays and object
 * - Resolve missing keys to avoid exceptions
 */
export const defaultPlugins = <P extends Processors = typeof defaultProcessors>(
  currentLocale: () => Intl.Locale | undefined,
  processors: P
) => [
  LocalePlugin(currentLocale),
  ArraysPlugin,
  ProcessorsPlugin(processors),
] as const;
