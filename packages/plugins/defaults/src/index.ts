import { LocaleProviderPlugin } from '@intl-schematic/plugin-locale';
import { ArraysPlugin } from '@intl-schematic/plugin-arrays';
import { Processors, ProcessorsPlugin } from '@intl-schematic/plugin-processors';
import { Plugin } from 'intl-schematic/plugins';

/**
 * Default schematic plugins
 *
 * Allow to:
 * - Access a user's locale in other plugins
 * - Process translation keys with custom processors
 * - Join and cross-reference translation records using arrays and object
 */
export const defaultPlugins = <P extends Processors>(
  currentLocale: () => Intl.Locale | undefined,
  processors: P,
  arraysDelimiter = ' '
) => [
  LocaleProviderPlugin(currentLocale),
  ArraysPlugin(arraysDelimiter),
  ProcessorsPlugin(processors),
] as const satisfies readonly Plugin[];

export * from '@intl-schematic/plugin-arrays';
export * from '@intl-schematic/plugin-locale';
export * from '@intl-schematic/plugin-processors';
export * from '@intl-schematic/plugin-processors/default';
export * from '@intl-schematic/plugin-processors/dictionary';
