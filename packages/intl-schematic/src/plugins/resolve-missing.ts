import { PluginHook, createPlugin } from './core';

/**
 * Simply returns the closest thing to a string it can find.
 *
 * If no options are left - directly returns a translation key.
 */
export const ResolveMissingKeyPlugin = new Proxy(createPlugin({ name: 'ResolveMissingKey' }), {
  get: (t, k): PluginHook<any, any> | string => (
    k === 'name'
      ? t.name
      : (value, input, ___, _, key) => (
        typeof value === 'string'
        ? value
        : (typeof input === 'string' ? input : key)
      )
  ),
});
