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

// packages/react/src/index.ts
var src_exports = {};
__export(src_exports, {
  createEffectTranslator: () => createEffectTranslator
});
module.exports = __toCommonJS(src_exports);
var import_react = require("react");
var import_intl_schematic = require("intl-schematic");
function createEffectTranslator(locale, plugins) {
  return (localeImport) => {
    const localeDoc = (0, import_react.useRef)();
    (0, import_react.useEffect)((lang = locale?.current) => {
      if (!lang) {
        return;
      }
      localeImport(lang).then((val) => {
        localeDoc.current = val.default;
        val.remote?.then((remote) => {
          if (remote) {
            localeDoc.current = {
              ...localeDoc.current,
              ...remote
            };
          }
        });
      });
    }, [locale]);
    const currentLocale = () => locale.current ?? new Intl.Locale(navigator.language);
    const currentDoc = () => localeDoc.current;
    return (0, import_intl_schematic.createTranslator)(currentDoc, plugins(currentLocale));
  };
}
