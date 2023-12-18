// packages/plugins/locale/src/index.ts
import { createPlugin } from "intl-schematic/plugins";
var LocaleProviderPlugin = (currentLocale) => createPlugin(
  "Locale",
  // Never match (invisible plugin)
  (_) => false,
  { info: currentLocale }
);
export {
  LocaleProviderPlugin
};
