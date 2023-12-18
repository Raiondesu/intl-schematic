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

// src/index.ts
var src_exports = {};
__export(src_exports, {
  ArraysPlugin: () => ArraysPlugin
});
module.exports = __toCommonJS(src_exports);
var import_plugins = require("intl-schematic/plugins");
function match(value) {
  return Array.isArray(value);
}
var ArraysPlugin = (defaultDelimiter = " ") => (0, import_plugins.createPlugin)("ArraysPlugin", match, {
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ArraysPlugin
});
