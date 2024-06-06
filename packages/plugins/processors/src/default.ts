import { dictionary } from './dictionary';
import { dateFormat } from './intl/date';
import { displayNames } from './intl/display';
import { numberFormat } from './intl/number';
import { pluralRules } from './intl/plural';

/**
 * Default schematic processors
 *
 * Allow to format data like number and dates in a locale-firendly manner,
 * all using browser-standard Intl API - with almost zero overhead
 */
export const defaultProcessors = {
  date: dateFormat,
  number: numberFormat,
  plural: pluralRules,
  display: displayNames,
  'intl/date': dateFormat,
  'intl/number': numberFormat,
  'intl/plural': pluralRules,
  'intl/display': displayNames,
  dictionary,
};

export * from './intl/_cache';

export {
  dateFormat,
  numberFormat,
  pluralRules,
  displayNames,
}
