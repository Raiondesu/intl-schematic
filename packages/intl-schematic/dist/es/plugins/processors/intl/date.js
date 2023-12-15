import { cachedIntl } from './_cache';
export const dateFormat = cachedIntl(Intl.DateTimeFormat, (date) => new Date(date));
