import { createPlugin } from './core';

declare module 'intl-schematic/plugins/core' {
  export interface PluginRegistry<Locale, Key> {
    NestedKeys: {
      args: Locale[Key] extends string ? [] : Leaves<Locale[Key]>;
    };
  }
}

type Leaf = string;

type NestedRecord = Leaf | {
  [branch: string]: Leaf | NestedRecord;
};

type Leaves<T> = T extends object ? {
  [K in keyof T]: [Exclude<K, symbol>, ...Leaves<T[K]> extends never ? [] : Leaves<T[K]>]
}[keyof T] : []

function match(value: unknown): value is NestedRecord {
  return (!!value && typeof value === 'object' && Object.values(value).some(match));
}

/**
 * Process a nested record of this format:
 * `{ "nested-key": "Some text", "other-nested-key": { "some-deeper-key": "Some other text" } }`
 *
 * Will find all nested keys referenced, resolve them
 * and output the final leaf string value, or a full key path if not found.
 */
export const NestedKeysPlugin = createPlugin('NestedKeys', match, {
  translate(...path: string[]) {
    const result = path.reduce<NestedRecord | undefined>((branch, leaf, index) => (
      typeof branch === 'string' || typeof branch === 'undefined'
        // found the final leaf
        ? branch
        // looking for the leaf
        : (
          leaf in branch
          // found a nested leaf, passing on...
          ? branch[leaf]
          // not found a leaf with this path, output debug info
          : (console.log(path.slice(0, index + 1).concat([JSON.stringify(branch)]).join('.')) as undefined)
        )
    ), this.value);

    if (typeof result === 'string') {
      return result;
    }
  }
});
