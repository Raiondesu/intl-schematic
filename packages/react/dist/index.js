// packages/react/src/index.ts
import { useRef, useEffect } from "react";
import { createTranslator } from "intl-schematic";
function createEffectTranslator(locale, plugins) {
  return (localeImport) => {
    const localeDoc = useRef();
    useEffect((lang = locale?.current) => {
      if (!lang) {
        return;
      }
      localeImport(lang).then((val) => {
        localeDoc.current = val.default;
        val.remote?.then((remote) => {
          if (remote) {
            localeDoc.current = {
              ...localeDoc.current,
              ...remote
            };
          }
        });
      });
    }, [locale]);
    const currentLocale = () => locale.current ?? new Intl.Locale(navigator.language);
    const currentDoc = () => localeDoc.current;
    return createTranslator(currentDoc, plugins(currentLocale));
  };
}
export {
  createEffectTranslator
};
