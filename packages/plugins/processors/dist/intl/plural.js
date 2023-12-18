// src/intl/plural.ts
var pluralRules = (locale) => {
  const plurals = new Intl.PluralRules(locale.language);
  const plural = (variants) => (amount) => variants[plurals.select(amount)] ?? Object.values(variants)[0] ?? String(plurals.select(amount));
  return plural;
};
export {
  pluralRules
};
