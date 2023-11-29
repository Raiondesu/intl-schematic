import { LocaleInputParameter } from '../ts.schema';
export declare const ObjectRecordPlugin: {
    name: string;
    keyFound(this: {
        translate: import("../ts.schema").TranslationProxy<any, any>;
        callHook: (hook: "initPlugin" | "docNotFound" | "keyNotFound" | "keyFound" | "processorFound" | "processorNotFound" | "keyProcessed" | "keyNotProcessed", value?: unknown) => string | undefined;
    }, key: unknown, input: LocaleInputParameter<any, string, any> | undefined): string | undefined;
};
//# sourceMappingURL=object-record.d.ts.map