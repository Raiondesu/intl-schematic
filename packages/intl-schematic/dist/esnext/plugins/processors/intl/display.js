import { cachedIntl } from './_cache';
class DisplayNames {
    displayNames;
    constructor(locale, options) {
        this.displayNames = new Intl.DisplayNames(options?.localeOverride ?? locale, options ?? { type: 'language' });
    }
    format(value) {
        return this.displayNames.of(value) ?? value;
    }
}
export const displayNames = cachedIntl(DisplayNames, x => x);
