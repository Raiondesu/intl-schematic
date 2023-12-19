// packages/plugins/arrays/src/index.ts
import { createPlugin } from "intl-schematic/plugins";
function match(value) {
  return Array.isArray(value);
}
var ArraysPlugin = (defaultSeparator = " ") => createPlugin("ArraysPlugin", match, {
  translate(referenceParams, separator = defaultSeparator) {
    const startsWithIndex = /^.*?:/;
    const processReference = (referencedKey) => {
      if (startsWithIndex.test(referencedKey)) {
        const [argIndexName, inputKey] = referencedKey.split(":");
        const argIndex = isNaN(Number(argIndexName)) ? 0 : Number(argIndexName);
        const references = normalizeRefs(referenceParams, inputKey);
        return [String(references[argIndex])];
      }
      const result2 = referencedKey in referenceParams ? this.translate(
        referencedKey,
        ...normalizeRefs(referenceParams, referencedKey)
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
      const refParamK = Object.keys(refK)[0];
      if (typeof referenceParams[refParamK] === "undefined" && refParamK in refK) {
        referenceParams[refParamK] = normalizeRefs(refK, refParamK);
      } else if (refParamK in refK) {
        const references = normalizeRefs(referenceParams, refParamK);
        const inlineParams = normalizeRefs(refK, refParamK);
        referenceParams[refParamK] = references.map((param, i) => {
          const inlineParam = inlineParams[i];
          return typeof param === "object" && typeof inlineParam === "object" ? { ...inlineParam, ...param } : param ?? inlineParam;
        });
      }
      return [...arr, ...processReference(refParamK)];
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
