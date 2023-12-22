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

// packages/plugins/nested/src/dot.ts
var dot_exports = {};
__export(dot_exports, {
  createDotNester: () => createDotNester
});
module.exports = __toCommonJS(dot_exports);
var import_intl_schematic = require("intl-schematic");
var import_plugin_nested = require("@intl-schematic/plugin-nested");
var createDotNester = (t2) => (keys) => {
  const [key, ...subkeys] = keys.split(".");
  return t2(key, ...subkeys);
};
var getDocument = () => ({
  "hello": {
    "world": "Hello, world!",
    "stranger": "Hello, stranger!"
  },
  "foo": {
    "bar": {
      "baz": "Foo Bar Baz!"
    }
  },
  "test": ""
});
var t = (0, import_intl_schematic.createTranslator)(getDocument, [import_plugin_nested.NestedKeysPlugin]);
var tn = createDotNester(t);
