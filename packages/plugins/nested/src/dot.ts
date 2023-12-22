import { TranslationFunction } from 'intl-schematic';
import { TypeOfKeys } from 'intl-schematic/plugins';
import { Branch } from './core';

export type DotLeaves<T> = T extends object ? {
  [K in keyof T]: `${Exclude<K, symbol>}${DotLeaves<T[K]> extends '' ? '' : `.${DotLeaves<T[K]>}`}`
}[keyof T] : '';

export type ArrKey<Keys extends string> = Keys extends `${infer K}.${infer S}`
  ? [K, ...ArrKey<S>]
  : [Keys];

export const createDotNester = <
  T extends TranslationFunction<any, any>,
  LocaleDoc extends Record<string, any> = T extends TranslationFunction<infer D, any> ? D : never
>(t: T) => <
  const Keys extends Pick<LocaleDoc, TypeOfKeys<LocaleDoc, Branch>> extends infer Doc ? DotLeaves<Doc> : never,
>(keys: Keys | (keyof Omit<LocaleDoc, TypeOfKeys<LocaleDoc, Branch>> & string)): string => {
  const [key, ...subkeys] = keys.split('.');
  return t(key, ...subkeys);
}

const getDocument = () => ({
  'hello': {
    'world': 'Hello, world!',
    'stranger': 'Hello, stranger!'
  },
  'foo': {
    'bar': {
      'baz': "Foo Bar Baz!"
    }
  },
  'test': '',
});
import { createTranslator } from 'intl-schematic';
import { NestedKeysPlugin } from '@intl-schematic/plugin-nested';

// Notice the plugins array parameter
const t = createTranslator(getDocument, [NestedKeysPlugin]);

const tn = createDotNester(t);
