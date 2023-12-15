export function createTranslator(getLocaleDocument, plugins) {
    function translate(key, ...args) {
        const doc = getLocaleDocument();
        const contextPlugins = this.plugins ?? plugins ?? [];
        for (const [index, plugin] of contextPlugins.entries())
            if (plugin.match(doc[key], key, doc)) {
                const pluginContext = createPluginContext(this, contextPlugins, plugin, index, doc, key, args);
                const pluginResult = plugin.translate.call(pluginContext, key, ...args);
                if (typeof pluginResult === 'string') {
                    return pluginResult;
                }
            }
        return doc[key] ?? key;
    }
    ;
    function createPluginContext(ctx, contextPlugins, currentPlugin, index, doc, key, args) {
        const contextualPlugins = contextPlugins.reduce((obj, pl) => ({
            ...obj,
            [pl.name]: createPluginInterface(pl),
        }), {});
        const createdContext = {
            name: currentPlugin.name,
            originalCallArgs: args,
            originalKey: key,
            originalValue: doc[key],
            ...ctx.pluginContext,
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
    return translate;
}
