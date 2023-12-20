// packages/vue/src/index.ts
import { ref, watch } from "vue";
import { createTranslator } from "intl-schematic";
function createLocaleResource(locale, plugins) {
  return (localeImport) => {
    const localeDoc = ref();
    watch(locale, (lang) => {
      if (!lang) {
        return;
      }
      localeImport(lang).then((val) => {
        localeDoc.value = val.default;
        val.remote?.then((remote) => {
          if (remote) {
            localeDoc.value = {
              ...localeDoc.value,
              ...remote
            };
          }
        });
      });
    });
    const currentLocale = () => locale.value ?? new Intl.Locale(navigator.language);
    const currentDoc = () => localeDoc.value;
    return createTranslator(currentDoc, plugins(currentLocale));
  };
}
export {
  createLocaleResource
};
