// packages/plugins/defaults/src/index.ts
import { LocaleProviderPlugin } from "@intl-schematic/plugin-locale";
import { ArraysPlugin } from "@intl-schematic/plugin-arrays";
import { ProcessorsPlugin } from "@intl-schematic/plugin-processors";
export * from "@intl-schematic/plugin-arrays";
export * from "@intl-schematic/plugin-locale";
export * from "@intl-schematic/plugin-processors";
export * from "@intl-schematic/plugin-processors/default";
export * from "@intl-schematic/plugin-processors/dictionary";
var defaultPlugins = (currentLocale, processors, arraysDelimiter = " ") => [
  LocaleProviderPlugin(currentLocale),
  ArraysPlugin(arraysDelimiter),
  ProcessorsPlugin(processors)
];
export {
  defaultPlugins
};
