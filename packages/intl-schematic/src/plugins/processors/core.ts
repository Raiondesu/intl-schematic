import { TranslationModule } from 'schema';

export type Processor = (locale: Intl.Locale) => (
  (parameter: any, key: string, document: TranslationModule) => (
    (input: any, overrideParameter?: any) => string
  )
);

export type Processors = Record<string, Processor>;

export type InputParameter<
  P extends Processors,
  O extends keyof P
> = Parameters<ReturnType<ReturnType<P[O]>>>[0];

export type OptionsParameter<
  P extends Processors,
  O extends keyof P
> = Parameters<ReturnType<P[O]>>[0];
