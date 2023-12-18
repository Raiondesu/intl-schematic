// packages/core/src/plugins.ts
var createPlugin = (name, match, options) => ({ name, match, translate: options.translate ?? (() => void 0), info: options.info });
export {
  createPlugin
};
