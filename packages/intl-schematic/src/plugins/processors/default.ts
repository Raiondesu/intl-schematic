import { Processors } from './core';
import { dateFormat } from './intl/date';
import { displayNames } from './intl/display';
import { numberFormat } from './intl/number';
import { pluralRules } from './intl/plural';

export const defaultProcessors = {
  date: dateFormat,
  number: numberFormat,
  plural: pluralRules,
  display: displayNames,
} satisfies Processors;

export * from './core';
