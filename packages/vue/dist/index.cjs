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

// packages/vue/src/index.ts
var src_exports = {};
__export(src_exports, {
  createLocaleResource: () => createLocaleResource
});
module.exports = __toCommonJS(src_exports);
var import_vue = require("vue");
var import_intl_schematic = require("intl-schematic");
function createLocaleResource(locale, plugins) {
  return (localeImport) => {
    const localeDoc = (0, import_vue.ref)();
    (0, import_vue.watch)(locale, (lang) => {
      if (!lang) {
        return;
      }
      localeImport(lang).then((val) => {
        localeDoc.value = val.default;
        val.remote?.then((remote) => {
          if (remote) {
            localeDoc.value = {
              ...localeDoc.value,
              ...remote
            };
          }
        });
      });
    });
    const currentLocale = () => locale.value ?? new Intl.Locale(navigator.language);
    const currentDoc = () => localeDoc.value;
    return (0, import_intl_schematic.createTranslator)(currentDoc, plugins(currentLocale));
  };
}
