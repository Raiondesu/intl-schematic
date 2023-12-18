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

// packages/plugins/processors/src/dictionary.ts
var dictionary_exports = {};
__export(dictionary_exports, {
  dictionary: () => dictionary
});
module.exports = __toCommonJS(dictionary_exports);
var dictionary = () => (options, key) => (input) => {
  const _input = typeof input === "string" ? { key: input, fallback: key } : {
    fallback: ("default" in input ? input.default : "fallback" in input ? input.fallback : void 0) ?? key,
    key: ("key" in input ? input.key : "value" in input ? input.value : "") ?? ""
  };
  try {
    return options && _input.key in options ? options[_input.key] : _input.fallback ?? key;
  } catch (error) {
    return _input.fallback ?? key;
  }
};
