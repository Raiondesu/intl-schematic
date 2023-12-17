import { TranslationDocument } from '../../ts.schema';

export type Processor<HandlesType = any, Parameter = any> = (locale: Intl.Locale) => (
  (parameter: Parameter, key: string, document: TranslationDocument) => (
    (input: HandlesType, overrideParameter?: Parameter) => string | undefined
  )
);

export type Processors<HandleTypes = any> = Record<string, Processor<HandleTypes>>;

export const getLocalizedProcessors = (processors: Processors, locale: Intl.Locale | undefined) => {
  if (!locale) {
    return {};
  }

  return Object.keys((processors)).reduce((obj, key: keyof Processors) => ({
    ...obj,
    [key]: (processors)[key](locale),
  }), {} as Record<string, ReturnType<Processor>>);
};

/**
 * The input arguments to a translation function in the format of 'name': 'default-value'. Provide a default value for each key.
 */
export type InputObject =
  | {
      /**
       * A key in the input object, value is used as a default
       *
       * This interface was referenced by `undefined`'s JSON-Schema definition
       * via the `patternProperty` "^.*$".
       */
      [k: string]:
        | unknown[]
        | boolean
        | number
        | null
        | {
            [k: string]: unknown;
          }
        | string;
    }
  | string
  | number
  | boolean
  | null;

/**
 * Parameter to pass into the processor function before passing in the input
 */
export type ParameterObject =
  | (
      | unknown[]
      | boolean
      | number
      | null
      | number
      | {
          [k: string]: unknown;
        }
      | string
    )[]
  | {
      /**
       * A key-value in the parameter object
       *
       * This interface was referenced by `undefined`'s JSON-Schema definition
       * via the `patternProperty` "^.*$".
       */
      [k: string]:
        | unknown[]
        | boolean
        | number
        | null
        | {
            [k: string]: unknown;
          }
        | string;
    };

type Only<Include, Exclude> = {
  [P in keyof Include]: Include[P];
} & {
  [P in keyof Exclude]?: never;
};

export type Either<One, Other> = Only<One, Other> | Only<Other, One>;
