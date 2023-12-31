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

// packages/solid/src/index.ts
var src_exports = {};
__export(src_exports, {
  createLocaleResource: () => createLocaleResource
});
module.exports = __toCommonJS(src_exports);
var import_solid_js = require("solid-js");
var import_intl_schematic = require("intl-schematic");
function createLocaleResource(getLocale, plugins) {
  return (localeImport) => {
    const [localeResource, { mutate }] = (0, import_solid_js.createResource)(
      getLocale,
      (localePromise) => Promise.resolve(localePromise).then((loc) => Promise.all([localeImport(loc), loc])).then(([localeDoc, locale]) => {
        localeDoc.remote?.then((loc) => {
          if (loc) {
            mutate(([prev, prevLocale] = [localeDoc.default, locale]) => [{ ...prev, ...loc }, prevLocale]);
          }
        });
        return [localeDoc.default, locale];
      })
    );
    const currentLocale = () => localeResource.latest?.[1] ?? new Intl.Locale(navigator.language);
    const currentDoc = () => localeResource.latest?.[0];
    return (0, import_intl_schematic.createTranslator)(currentDoc, plugins(currentLocale));
  };
}
