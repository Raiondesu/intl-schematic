export const getLocalizedProcessors = (processors, locale) => {
    if (!locale) {
        return {};
    }
    return Object.keys((processors)).reduce((obj, key) => ({
        ...obj,
        [key]: (processors)[key](locale),
    }), {});
};
