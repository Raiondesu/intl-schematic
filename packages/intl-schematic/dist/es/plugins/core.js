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
    const callPluginsForHook = (hook, ...[value, input, parameter, currentLocaleId, key, doc, initiatorPlugin]) => {
        if (!pluginsPerHook[hook]) {
            return !value ? undefined : String(value);
        }
        let val = value;
        for (const pluginHook of pluginsPerHook[hook]) {
            const pluginResult = pluginHook.call({
                callHook(_hook, value) {
                    if (hook === _hook) {
                        // Prevent recursion
                        return;
                    }
                    return callPluginsForHook(_hook, value, input, parameter, currentLocaleId, key, doc, pluginHook.name);
                },
                translate
            }, val, input, parameter, currentLocaleId, key, doc, initiatorPlugin);
            if (typeof pluginResult === 'string') {
                return pluginResult;
            }
            if (pluginResult != null) {
                val = pluginResult;
            }
        }
        return !val ? undefined : String(val);
    };
    return callPluginsForHook;
};
export const createPlugin = (plugin) => plugin;
