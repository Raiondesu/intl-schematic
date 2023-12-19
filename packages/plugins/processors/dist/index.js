// packages/plugins/processors/src/index.ts
import { createPlugin } from "intl-schematic/plugins";

// packages/plugins/processors/src/plugin-core.ts
var getLocalizedProcessors = (processors, locale) => {
  return Object.keys(processors).reduce((obj, key) => ({
    ...obj,
    [key]: processors[key](locale)
  }), {});
};

// packages/plugins/processors/src/index.ts
var ProcessorsPlugin = (processors) => {
  const localizedProcessorsByLocale = {};
  return createPlugin(
    "ProcessorsPlugin",
    function isParametrized(value) {
      if (typeof value !== "object" || value == null) {
        return false;
      }
      const keys = Object.keys(value);
      const other = [];
      const processorKeys = keys.filter((k) => k in processors ? true : (other.push(k), false));
      const legacyKeys = ["input", "parameter", "processor"];
      return processorKeys.length === 1 && other.every((k) => k === "input") || processorKeys.length === 0 && other.every((k) => legacyKeys.includes(k));
    },
    {
      info: processors,
      translate(input, parameter) {
        const locale = this.plugins.Locale?.info() ?? new Intl.Locale("ia");
        const localizedProcessors = localizedProcessorsByLocale[String(locale.baseName)] ??= getLocalizedProcessors(processors, locale);
        const processorName = "processor" in this.value && typeof this.value.processor === "object" ? Object.keys(this.value.processor)[0] : Object.keys(this.value)[0];
        const processor = localizedProcessors[processorName];
        if (!processor) {
          return void 0;
        }
        const inlineParameter = "parameter" in this.value ? this.value.parameter : this.value[processorName];
        const mergedInput = this.value.input ? mergeInputs(
          this.value.input,
          input
        ) : input;
        const mergedParameter = {
          ...inlineParameter,
          ...parameter
        };
        const getProcessedResult = processor(mergedParameter, this.key, this.doc);
        const result = getProcessedResult(mergedInput, mergedParameter);
        return result ?? void 0;
      }
    }
  );
};
function mergeInputs(baseInput, input) {
  if (typeof input === "object" && input != null) {
    for (const prop in input)
      if (input[prop] == null) {
        delete input[prop];
      }
  }
  const mergedInput = typeof baseInput === "object" && typeof input === "object" ? { ...baseInput, ...input } : input ?? baseInput;
  return mergedInput;
}
export {
  ProcessorsPlugin,
  getLocalizedProcessors
};
