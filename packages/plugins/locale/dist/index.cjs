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

// packages/plugins/locale/src/index.ts
var src_exports = {};
__export(src_exports, {
  LocaleProviderPlugin: () => LocaleProviderPlugin
});
module.exports = __toCommonJS(src_exports);
var import_plugins = require("intl-schematic/plugins");
var LocaleProviderPlugin = (currentLocale) => (0, import_plugins.createPlugin)(
  "Locale",
  // Never match (invisible plugin)
  (_) => false,
  { info: currentLocale }
);
