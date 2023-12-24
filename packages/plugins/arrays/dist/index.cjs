"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// packages/plugins/arrays/src/index.ts
var src_exports = {};
__export(src_exports, {
  ArraysPlugin: () => ArraysPlugin
});
module.exports = __toCommonJS(src_exports);
var import_plugins = require("intl-schematic/plugins");
function match(value) {
  return Array.isArray(value);
}
var ArraysPlugin = (defaultSeparator = " ") => (0, import_plugins.createPlugin)("ArraysPlugin", match, {
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
