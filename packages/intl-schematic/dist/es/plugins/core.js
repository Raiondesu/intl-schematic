export const callPlugins = (translate, plugins = []) => {
    const pluginsPerHook = plugins.reduce((obj, plugin) => {
        for (const _hookName in plugin)
            if (typeof plugin[_hookName] === 'function') {
                const hookName = _hookName;
                const hook = plugin[hookName];
                if (hookName in obj) {
                    obj[hookName].push(hook);
                }
                else {
                    obj[hookName] = [hook];
                }
            }
        return obj;
    }, {});
    console.log(pluginsPerHook);
    const callPluginsForHook = (hook, ...[value, input, parameter, key, currentLocaleId, doc, initiatorPlugin]) => String(pluginsPerHook[hook]?.reduce((val, pluginHook) => (pluginHook?.call({
        callHook(hook, value) {
            return callPluginsForHook(hook, value, input, parameter, key, currentLocaleId, doc, pluginHook.name);
        },
        translate
    }, val, input, parameter, key, currentLocaleId, doc, initiatorPlugin) ?? val), value) ?? value);
    return callPluginsForHook;
};
export const createPlugin = (plugin) => plugin;
