import { LocaleInputParameter } from '../ts.schema';
export declare const ProcessorPlugin: {
    name: string;
    initPlugin(this: {
        translate: import("../ts.schema").TranslationProxy<any, any>;
        callHook: (hook: "initPlugin" | "docNotFound" | "keyNotFound" | "keyFound" | "processorFound" | "processorNotFound" | "keyProcessed" | "keyNotProcessed", value?: unknown) => string | undefined;
    }, processors: unknown): undefined;
    keyFound(this: {
        translate: import("../ts.schema").TranslationProxy<any, any>;
        callHook: (hook: "initPlugin" | "docNotFound" | "keyNotFound" | "keyFound" | "processorFound" | "processorNotFound" | "keyProcessed" | "keyNotProcessed", value?: unknown) => string | undefined;
    }, record: unknown, input: LocaleInputParameter<any, string, any> | undefined, parameter: import("../ts.schema").LocaleOptionsParameter<any, string, any> | undefined, currentLocaleId: () => Intl.Locale | undefined, key: string, doc: any): string | undefined;
};
//# sourceMappingURL=processed-record.d.ts.map