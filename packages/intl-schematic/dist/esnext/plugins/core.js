export const createPlugin = (name, match, options) => ({ name, match, translate: options.translate ?? (() => undefined), info: options.info });
