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

// packages/cli/src/init.ts
var init_exports = {};
__export(init_exports, {
  init: () => init
});
module.exports = __toCommonJS(init_exports);
var import_colorette = require("colorette");
var import_fs = require("fs");
var import_path = require("path");
function init(outputFile = "translation.schema.json") {
  console.log(`${(0, import_colorette.bold)((0, import_colorette.blue)("intl-schematic"))}: detecting installed plugins...`);
  const dependencies = (0, import_fs.readdirSync)(cwd("node_modules/@intl-schematic"));
  console.log(`${(0, import_colorette.bold)((0, import_colorette.blue)("intl-schematic"))}: detected plugins:`);
  const schematicPlugins = dependencies.filter((pluginName) => {
    if (!pluginName.startsWith("plugin")) {
      return false;
    }
    if ((0, import_fs.existsSync)(cwd("node_modules", "@intl-schematic", pluginName, "property.schema.json"))) {
      console.log(`	 - \u2705 @intl-schematic/${(0, import_colorette.bold)((0, import_colorette.green)(pluginName))} - schema detected`);
      return true;
    }
    console.log(`	 - \u{1F50C} @intl-schematic/${(0, import_colorette.gray)(pluginName)}`);
    return false;
  });
  schematicPlugins.forEach((plugin) => {
  });
  console.log(`${(0, import_colorette.bold)((0, import_colorette.blue)("intl-schematic"))}: writing to file`, outputFile);
  const schema = JSON.stringify({
    "$ref": "https://unpkg.com/intl-schematic/translation.schema.json",
    "additionalProperties": {
      "anyOf": schematicPlugins.map((plugin) => ({
        "$ref": `https://unpkg.com/@intl-schematic/${plugin}/property.schema.json`
      })).concat({
        "$ref": "https://unpkg.com/intl-schematic/property.schema.json"
      })
    }
  }, null, 4);
  (0, import_fs.writeFileSync)(cwd(outputFile), schema);
  function cwd(...paths) {
    return (0, import_path.join)(process.cwd(), ...paths);
  }
}
