// packages/plugins/processors/src/plugin-core.ts
var getLocalizedProcessors = (processors, locale) => {
  return Object.keys(processors).reduce((obj, key) => ({
    ...obj,
    [key]: processors[key](locale)
  }), {});
};
export {
  getLocalizedProcessors
};
