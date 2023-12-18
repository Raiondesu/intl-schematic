// packages/plugins/arrays/src/index.ts
import { createPlugin } from "intl-schematic/plugins";
function match(value) {
  return Array.isArray(value);
}
var ArraysPlugin = (defaultDelimiter = " ") => createPlugin("ArraysPlugin", match, {
  translate(referenceParams, delimiter = defaultDelimiter) {
    const startsWithIndex = /^\d+:/;
    const processReference = (referencedKey) => {
      if (startsWithIndex.test(referencedKey)) {
        const [argIndexName, inputKey] = referencedKey.split(":");
        const argIndex = isNaN(Number(argIndexName)) ? 0 : Number(argIndexName);
        return [String(referenceParams[inputKey][argIndex])];
      }
      const result2 = this.translate(
        referencedKey,
        ...referenceParams[referencedKey]
      );
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
        referenceParams[refParamK] = refK[refParamK];
      } else if (refParamK in refK) {
        const inlineParams = refK[refParamK];
        referenceParams[refParamK] = referenceParams[refParamK].map((param, i) => {
          const inlineParam = inlineParams[i];
          return typeof param === "object" && typeof inlineParam === "object" ? { ...inlineParam, ...param } : param ?? inlineParam;
        });
      }
      return [...arr, ...processReference(refParamK)];
    }, []);
    if (typeof delimiter === "string") {
      return result.join(delimiter);
    }
    return delimiter(result, defaultDelimiter);
  }
});
export {
  ArraysPlugin
};
