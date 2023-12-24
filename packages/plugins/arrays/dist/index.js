// packages/plugins/arrays/src/index.ts
import { createPlugin } from "intl-schematic/plugins";
function match(value) {
  return Array.isArray(value);
}
var ArraysPlugin = (defaultSeparator = " ") => createPlugin("ArraysPlugin", match, {
  translate(referenceParamsByKey, separator = defaultSeparator) {
    const startsWithIndex = /^.*?:/;
    const safeReferences = referenceParamsByKey ?? {};
    const processReference = (referencedKey) => {
      if (startsWithIndex.test(referencedKey)) {
        const [argIndexName, inputKey] = referencedKey.split(":");
        const argIndex = isNaN(Number(argIndexName)) ? 0 : Number(argIndexName);
        const references = normalizeRefs(safeReferences, inputKey);
        return [String(references[argIndex])];
      }
      const result2 = referencedKey in safeReferences ? this.translate(
        referencedKey,
        ...normalizeRefs(safeReferences, referencedKey)
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
      if (typeof safeReferences[refParamKey] === "undefined" && refParamKey in refK) {
        safeReferences[refParamKey] = normalizeRefs(refK, refParamKey);
      } else if (refParamKey in refK) {
        const referenceParams = normalizeRefs(safeReferences, refParamKey);
        const inlineParams = normalizeRefs(refK, refParamKey);
        safeReferences[refParamKey] = referenceParams.map((param, i) => {
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
      const reference = referenceMap[referenceKey];
      return Array.isArray(reference) ? reference : reference == null ? [] : [reference];
    }
  }
});
export {
  ArraysPlugin
};
