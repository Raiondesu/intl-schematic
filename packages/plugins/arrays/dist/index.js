// packages/plugins/arrays/src/index.ts
import { createPlugin } from "intl-schematic/plugins";
function match(value) {
  return Array.isArray(value);
}
var ArraysPlugin = (defaultSeparator = " ") => createPlugin("ArraysPlugin", match, {
  translate(referenceParamsByKey, separator = defaultSeparator) {
    const startsWithIndex = /^.*?:/;
    const processReference = (referencedKey) => {
      if (startsWithIndex.test(referencedKey)) {
        const [argIndexName, inputKey] = referencedKey.split(":");
        const argIndex = isNaN(Number(argIndexName)) ? 0 : Number(argIndexName);
        const references = normalizeRefs(referenceParamsByKey, inputKey);
        return [String(references[argIndex])];
      }
      const result2 = referencedKey in referenceParamsByKey ? this.translate(
        referencedKey,
        ...normalizeRefs(referenceParamsByKey, referencedKey)
      ) : this.translate(referencedKey);
      if (typeof result2 === "string") {
        return [result2];
      }
      return [];
    };
    const result = this.value.reduce((arr, refK) => {
      if (typeof refK === "string") {
        return [...arr, ...processReference(refK)];
      }
      const refParamKey = Object.keys(refK)[0];
      if (typeof referenceParamsByKey[refParamKey] === "undefined" && refParamKey in refK) {
        referenceParamsByKey[refParamKey] = normalizeRefs(refK, refParamKey);
      } else if (refParamKey in refK) {
        const referenceParams = normalizeRefs(referenceParamsByKey, refParamKey);
        const inlineParams = normalizeRefs(refK, refParamKey);
        referenceParamsByKey[refParamKey] = referenceParams.map((param, i) => {
          const inlineParam = inlineParams[i];
          return typeof param === "object" && typeof inlineParam === "object" ? { ...inlineParam, ...param } : param ?? inlineParam;
        });
      }
      return [...arr, ...processReference(refParamKey)];
    }, []);
    if (typeof separator === "string") {
      return result.join(separator);
    }
    return separator(result, defaultSeparator);
    function normalizeRefs(referenceMap, referenceKey) {
      return Array.isArray(referenceMap[referenceKey]) ? referenceMap[referenceKey] : [referenceMap[referenceKey]];
    }
  }
});
export {
  ArraysPlugin
};
