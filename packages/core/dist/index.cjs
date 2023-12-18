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

// src/index.ts
var src_exports = {};
__export(src_exports, {
  createTranslator: () => createTranslator
});
module.exports = __toCommonJS(src_exports);
function createTranslator(getLocaleDocument, plugins) {
  return function translate(key, ...args) {
    const doc = getLocaleDocument();
    if (!(key in doc)) {
      return key;
    }
    const contextPlugins = this.plugins ?? plugins ?? [];
    for (const [index, plugin] of contextPlugins.entries())
      if (plugin.match(doc[key], key, doc)) {
        const pluginContext = createPluginContext.call(this, plugin, index);
        try {
          const pluginResult = plugin.translate.call(pluginContext, ...args);
          if (typeof pluginResult === "string") {
            return pluginResult;
          }
        } catch {
        }
      }
    const plainKey = doc[key];
    return typeof plainKey === "string" ? plainKey : key;
    function createPluginContext(plugin, index) {
      const contextualPlugins = contextPlugins.reduce((obj, pl) => ({
        ...obj,
        [pl.name]: createPluginInterface(pl)
      }), {});
      const createdContext = {
        name: plugin.name,
        originalCallArgs: args,
        originalKey: key,
        originalValue: doc[key],
        ...this.pluginContext,
        plugins: contextualPlugins,
        doc,
        key,
        value: doc[key],
        translate: translateFromContext
      };
      return createdContext;
      function translateFromContext(subkey, ...args2) {
        return translate.call({
          plugins: subkey !== key ? contextPlugins : contextPlugins?.slice(index),
          pluginContext: createdContext
        }, subkey, ...args2);
      }
      function createPluginInterface(pt) {
        return {
          translate: (subkey, ...args2) => pt.translate.call({
            ...createdContext,
            key: subkey,
            value: doc[subkey]
          }, ...args2),
          match: pt.match,
          info: pt.info
        };
      }
    }
  }.bind({ plugins });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createTranslator
});
