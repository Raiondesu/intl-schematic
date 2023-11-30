import { ArrayRecordPlugin } from './arrays';
import { ObjectRecordPlugin } from './object-record';
import { ProcessorPlugin } from './processors';
import { ResolveMissingKeyPlugin } from './resolve-missing';

export const defaultPlugins = [
  ProcessorPlugin,
  ArrayRecordPlugin,
  ObjectRecordPlugin,
  ResolveMissingKeyPlugin,
];
