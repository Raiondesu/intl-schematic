import { Translation, LocaleInputParameter, LocaleKey, TranslationProxy, LocaleOptionsParameter } from '../ts.schema';

export type PluginHook<Locale extends Translation, Processors> = (
  this: {
    translate: TranslationProxy<Locale, Processors>
    callHook: (
      hook: PluginHooks,
      value?: unknown
    ) => string | undefined;
  },
  value: unknown | undefined,
  input: LocaleInputParameter<Locale, LocaleKey<Locale>, Processors> | undefined,
  parameter: LocaleOptionsParameter<Locale, LocaleKey<Locale>, Processors> | undefined,
  currentLocaleId: () => Intl.Locale | undefined,
  key: string,
  translationDocument: Locale | undefined,
  initiatorPlugin: string | undefined
) => string | undefined;

export interface Plugin<Locale extends Translation, Processors> {
  name: string;
  initPlugin?: PluginHook<Locale, Processors>;
  docNotFound?: PluginHook<Locale, Processors>;
  keyNotFound?: PluginHook<Locale, Processors>;
  keyFound?: PluginHook<Locale, Processors>;
  processorFound?: PluginHook<Locale, Processors>;
  processorNotFound?: PluginHook<Locale, Processors>;
  keyProcessed?: PluginHook<Locale, Processors>;
  keyNotProcessed?: PluginHook<Locale, Processors>;
}

type PluginHooks = keyof Omit<Plugin<any, any>, 'name'>;

export const callPlugins = <Locale extends Translation, Processors>(
  translate: TranslationProxy<Locale, Processors>,
  plugins: Plugin<Locale, Processors>[] = [],
) => (
  (hook: PluginHooks, ...[
    value,
    input,
    parameter,
    key,
    currentLocaleId,
    doc,
    initiatorPlugin
  ]: Parameters<PluginHook<Locale, Processors>>): string | undefined => String(
    plugins.reduce(
      (val, plugin) => (
        console.log('calling plugin on', hook, ':', plugin.name),
        plugin[hook]?.call({
          callHook(hook, value) {
            return callPlugins(translate, plugins)(hook, value, input, parameter, key, currentLocaleId, doc, plugin.name);
          },
          translate
        }, val, input, parameter, key, currentLocaleId, doc, initiatorPlugin) ?? val
      ),
      value
    )
  )
);

export const createPlugin = <T extends Plugin<any, any>>(plugin: T): T => plugin;
