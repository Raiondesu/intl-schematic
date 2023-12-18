// packages/core/src/index.ts
function createTranslator(getLocaleDocument, plugins) {
  return function translate(key, ...args) {
    const doc = getLocaleDocument();
    if (!doc || !(key in doc)) {
      return key;
    }
    const contextPlugins = this.plugins ?? plugins ?? [];
    for (const [index, plugin] of contextPlugins.entries())
      if (plugin.match(doc[key], key, doc)) {
        const pluginContext = createPluginContext.call(this, plugin, index, doc);
        try {
          const pluginResult = plugin.translate.call(pluginContext, ...args);
          if (typeof pluginResult === "string") {
            return pluginResult;
          }
        } catch (error) {
          console.error(`[intl-schematic] ${plugin.name} error for key "${key}":
`, error);
        }
      }
    const plainKey = doc[key];
    return typeof plainKey === "string" ? plainKey : key;
    function createPluginContext(plugin, index, doc2) {
      const contextualPlugins = contextPlugins.reduce((obj, pl) => ({
        ...obj,
        [pl.name]: createPluginInterface(pl)
      }), {});
      const createdContext = {
        name: plugin.name,
        originalCallArgs: args,
        originalKey: key,
        originalValue: doc2[key],
        ...this.pluginContext,
        plugins: contextualPlugins,
        doc: doc2,
        key,
        value: doc2[key],
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
            value: doc2[subkey]
          }, ...args2),
          match: pt.match,
          info: pt.info
        };
      }
    }
  }.bind({ plugins });
}
export {
  createTranslator
};
