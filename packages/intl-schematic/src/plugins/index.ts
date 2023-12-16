import { LocaleProviderPlugin } from './locale';
import { ArraysPlugin } from './arrays';
import { Processors, ProcessorsPlugin } from './processors/plugin';
import { defaultProcessors } from './processors';

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
  processors: P
) => [
  LocaleProviderPlugin(currentLocale),
  ArraysPlugin,
  ProcessorsPlugin(processors),
] as const;
