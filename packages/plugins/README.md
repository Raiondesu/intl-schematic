# Plugins API

`intl-schematic` implements a comprehensive plugin system that allows to expand its functionality by hooking into the translator function.

All plugins are aware of each other at runtime and retain a mutable context to exchange information.

## Definition

A plugin is a simple object with the following properties:
- `name` - a **unique** (in the context of its usage) name for the plugin;
- `match(value)` - a method that defines if a currently processed key-value pair is suitable for the plugin
- `translate()` - a method that can return a string translated by the plugin
- `info` - any information that the plugin might need or provide to other plugins at runtime

Most plugins, however, should be created using the `createPlugin` function:
```ts
import { createPlugin } from 'intl-schematic/plugins';

const MyPlugin = createPlugin(
  // First parameter defines the name
  'MyPlugin',
  // Second parameter defines the match function
  function match(value): value is Record<string, number> {},
  // Third parameter defines everything else
  {
    // Plugin info
    info: { myPlugin: "it's my plugin!" },

    // translate method
    translate(...args: unknown[]): string | undefined {
      // context-aware
      this.key
      this.value
      this.doc
      this.plugins

      return 'string' || undefined;
    }
  }
)
```

This function simplifies type-checking and allows to define `name` and `match` without using object property names.

## `name`

## `match`

## `translate`

### `this` context

### Using other plugins

## `info`

## Advanced type-checking

### `match` type-guards

### `PluginRegistry`

### Generalizing translation types
