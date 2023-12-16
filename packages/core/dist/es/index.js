export function createTranslator(getLocaleDocument, plugins) {
    return (function translate(key, ...args) {
        const doc = getLocaleDocument();
        const contextPlugins = this.plugins ?? plugins ?? [];
        for (const [index, plugin] of contextPlugins.entries())
            if (plugin.match(doc[key], key, doc)) {
                const pluginContext = createPluginContext.call(this, plugin, index);
                try {
                    const pluginResult = plugin.translate.call(pluginContext, ...args);
                    if (typeof pluginResult === 'string') {
                        return pluginResult;
                    }
                }
                catch { }
            }
        const plainKey = doc[key];
        return typeof plainKey === 'string' ? plainKey : key;
        function createPluginContext(plugin, index) {
            const contextualPlugins = contextPlugins.reduce((obj, pl) => ({
                ...obj,
                [pl.name]: createPluginInterface(pl),
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
                translate: translateFromContext,
            };
            return createdContext;
            function translateFromContext(subkey, ...args) {
                return translate.call({
                    plugins: subkey !== key
                        ? contextPlugins
                        : contextPlugins?.slice(index),
                    pluginContext: createdContext,
                }, subkey, ...args);
            }
            function createPluginInterface(pt) {
                return {
                    translate: (subkey, ...args) => (pt.translate.call({
                        ...createdContext,
                        key: subkey,
                        value: doc[subkey]
                    }, ...args)),
                    match: pt.match,
                    info: pt.info,
                };
            }
        }
    }).bind({ plugins });
}