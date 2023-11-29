import { Processors } from './processors';
import { Translation, LocaleInputParameter, LocaleKey } from './ts.schema';

export type PluginHook<Locale extends Translation> = (
  this: {
    callHook: (
      hook: keyof Omit<Plugin<Locale>, 'name'>,
      value?: string,
      processor?: string,
    ) => string | undefined;
  },
  key: string,
  input: LocaleInputParameter<Locale, LocaleKey<Locale>, Processors> | undefined,
  value: string | undefined,
  processorName: string | undefined,
  translationDocument: Locale | undefined
) => string | undefined;

export interface Plugin<Locale extends Translation> {
  name: string;
  docNotFound: PluginHook<Locale>;
  keyNotFound: PluginHook<Locale>;
  keyFound: PluginHook<Locale>;
  processorFound: PluginHook<Locale>;
  processorNotFound: PluginHook<Locale>;
  keyProcessed: PluginHook<Locale>;
  keyNotProcessed: PluginHook<Locale>;
}

export const callPlugins = <Locale extends Translation>(plugins: Plugin<Locale>[] = []) => (
  (hook: keyof Omit<Plugin<Locale>, 'name'>, ...[key, input, value, processor, doc]: Parameters<PluginHook<Locale>>): string | undefined => (
    plugins.reduce<string | undefined>(
      (val, plugin) => plugin[hook].call({
        callHook(hook, value, processor) {
          return callPlugins(plugins)(hook, key, input, value, processor, doc);
        },
      }, key, input, val, processor, doc),
      value
    )
  )
);

export const ResolveMissingKeyPlugin = new Proxy({ name: 'NotFoundPlugin' } as Plugin<any>, {
  get: (t, k): PluginHook<any> | string => (
    k in t
      ? t[k as keyof typeof t]
      : (key, input, value) => (
        typeof value === 'string'
        ? value
        : (typeof input === 'string' ? input : key)
      )
  ),
});
