import { Translation, LocaleInputParameter, LocaleKey, TranslationProxy, LocaleOptionsParameter } from '../ts.schema';
export type PluginHook<Locale extends Translation, Processors> = (this: {
    translate: TranslationProxy<Locale, Processors>;
    callHook: (hook: PluginHooks, value?: unknown) => string | undefined;
}, value: unknown | undefined, input: LocaleInputParameter<Locale, LocaleKey<Locale>, Processors> | undefined, parameter: LocaleOptionsParameter<Locale, LocaleKey<Locale>, Processors> | undefined, currentLocaleId: () => Intl.Locale | undefined, key: string, translationDocument: Locale | undefined, initiatorPlugin: string | undefined) => string | undefined;
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
export declare const callPlugins: <Locale extends import("../ts.schema").TranslationModule, Processors>(translate: TranslationProxy<Locale, Processors>, plugins?: Plugin<Locale, Processors>[]) => (hook: PluginHooks, value: unknown, input: LocaleInputParameter<Locale, Extract<Exclude<keyof Locale, "$schema">, string>, Processors> | undefined, parameter: LocaleOptionsParameter<Locale, Extract<Exclude<keyof Locale, "$schema">, string>, Processors> | undefined, currentLocaleId: () => Intl.Locale | undefined, key: string, translationDocument: Locale | undefined, initiatorPlugin: string | undefined) => string | undefined;
export declare const createPlugin: <T extends Plugin<any, any>>(plugin: T) => T;
export {};
//# sourceMappingURL=core.d.ts.map