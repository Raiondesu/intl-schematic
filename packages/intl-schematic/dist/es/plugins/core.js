export const callPlugins = (translate, plugins = []) => ((hook, ...[value, input, parameter, key, currentLocaleId, doc, initiatorPlugin]) => String(plugins.reduce((val, plugin) => (console.log('calling plugin on', hook, ':', plugin.name),
    plugin[hook]?.call({
        callHook(hook, value) {
            return callPlugins(translate, plugins)(hook, value, input, parameter, key, currentLocaleId, doc, plugin.name);
        },
        translate
    }, val, input, parameter, key, currentLocaleId, doc, initiatorPlugin) ?? val), value)));
export const createPlugin = (plugin) => plugin;
