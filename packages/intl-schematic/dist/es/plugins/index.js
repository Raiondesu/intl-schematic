import { ArrayRecordPlugin } from './array-record';
import { ObjectRecordPlugin } from './object-record';
import { ProcessorPlugin } from './processed-record';
import { ResolveMissingKeyPlugin } from './resolve-missing';
export const defaultPlugins = [
    ProcessorPlugin,
    ArrayRecordPlugin,
    ObjectRecordPlugin,
    ResolveMissingKeyPlugin,
];
