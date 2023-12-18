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

// src/intl/plural.ts
var plural_exports = {};
__export(plural_exports, {
  pluralRules: () => pluralRules
});
module.exports = __toCommonJS(plural_exports);
var pluralRules = (locale) => {
  const plurals = new Intl.PluralRules(locale.language);
  const plural = (variants) => (amount) => variants[plurals.select(amount)] ?? Object.values(variants)[0] ?? String(plurals.select(amount));
  return plural;
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  pluralRules
});
