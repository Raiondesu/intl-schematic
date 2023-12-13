import { createPlugin } from 'core';

declare module 'intl-schematic/core' {
  export interface Plugins<Locale, Key> {
    NestedKeys: Locale[Key] extends string ? [] : Leaves<Locale[Key]>;
  }
}

type Leaf = string;

type NestedRecord = Leaf | {
  [branch: string]: Leaf | NestedRecord;
};

type Leaves<T> = T extends object ? {
  [K in keyof T]: [Exclude<K, symbol>, ...Leaves<T[K]> extends never ? [] : Leaves<T[K]>]
}[keyof T] : []

/**
 * Process an nested record of this format:
 * `{ "key": "Some text", "other-nested-key": { "some-deeper-key": "Some other text" } }`
 *
 * Will find all nested keys referenced, resolve them
 * and output the final leaf string value, or a full key path if not found.
 */
export const NestedKeysPlugin = createPlugin(
  'NestedKeys',

  function match(value): value is NestedRecord {
    return (!!value && typeof value === 'object' && Object.values(value).some(match)) || typeof value === 'string';
  },

  function translate(...path: string[]): string {
    const result = path.reduce((branch, leaf, index) => (
      typeof branch === 'string'
        // found the final leaf
        ? branch
        // looking for the leaf
        : (
          leaf in branch
          // found a nested leaf, passing on...
          ? branch[leaf]
          // not found a leaf with this path, output debug info
          : [this.key].concat(path.slice(0, index + 1), JSON.stringify(branch)).join('.'))
    ), this.value);

    if (typeof result === 'string') {
      return result;
    }

    return [this.key].concat(path).join('.');
  }
);

