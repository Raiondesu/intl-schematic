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

// packages/plugins/functions/src/index.ts
var src_exports = {};
__export(src_exports, {
  FunctionsPlugin: () => FunctionsPlugin
});
module.exports = __toCommonJS(src_exports);
var import_plugins = require("intl-schematic/plugins");
function match(value) {
  return typeof value === "function";
}
var FunctionsPlugin = (0, import_plugins.createPlugin)("Functions", match, {
  translate(...args) {
    return this.value(...args);
  }
});
