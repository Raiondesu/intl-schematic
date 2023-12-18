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
var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// packages/plugins/defaults/src/index.ts
var src_exports = {};
__export(src_exports, {
  defaultPlugins: () => defaultPlugins
});
module.exports = __toCommonJS(src_exports);
var import_plugin_locale = require("@intl-schematic/plugin-locale");
var import_plugin_arrays = require("@intl-schematic/plugin-arrays");
var import_plugin_processors = require("@intl-schematic/plugin-processors");
__reExport(src_exports, require("@intl-schematic/plugin-arrays"), module.exports);
__reExport(src_exports, require("@intl-schematic/plugin-locale"), module.exports);
__reExport(src_exports, require("@intl-schematic/plugin-processors"), module.exports);
__reExport(src_exports, require("@intl-schematic/plugin-processors/default"), module.exports);
__reExport(src_exports, require("@intl-schematic/plugin-processors/dictionary"), module.exports);
var defaultPlugins = (currentLocale, processors, arraysDelimiter = " ") => [
  (0, import_plugin_locale.LocaleProviderPlugin)(currentLocale),
  (0, import_plugin_arrays.ArraysPlugin)(arraysDelimiter),
  (0, import_plugin_processors.ProcessorsPlugin)(processors)
];
