import { ArrayRecordPlugin } from './arrays';
import { ObjectRecordPlugin } from './object-record';
import { ProcessorPlugin } from './processors';
import { ResolveMissingKeyPlugin } from './resolve-missing';

/**
 * Default schematic plugins
 *
 * Allow to:
 * - Process translation keys with custom processors
 * - Join and cross-reference translation records using arrays and object
 * - Resolve missing keys to avoid exceptions
 */
export const defaultPlugins = [
  ProcessorPlugin,
  ArrayRecordPlugin,
  ObjectRecordPlugin,
  ResolveMissingKeyPlugin,
];
