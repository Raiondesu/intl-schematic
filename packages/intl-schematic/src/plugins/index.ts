import { ArraysPlugin } from './arrays';
import { ProcessorPlugin } from './processors';
import { defaultProcessors } from './processors/default';

/**
 * Default schematic plugins
 *
 * Allow to:
 * - Process translation keys with custom processors
 * - Join and cross-reference translation records using arrays and object
 * - Resolve missing keys to avoid exceptions
 */
export const defaultPlugins = [
  ArraysPlugin,
  ProcessorPlugin(defaultProcessors),
] as const;
