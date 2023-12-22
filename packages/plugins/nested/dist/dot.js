// packages/plugins/nested/src/dot.ts
import { createTranslator } from "intl-schematic";
import { NestedKeysPlugin } from "@intl-schematic/plugin-nested";
var createDotNester = (t2) => (keys) => {
  const [key, ...subkeys] = keys.split(".");
  return t2(key, ...subkeys);
};
var getDocument = () => ({
  "hello": {
    "world": "Hello, world!",
    "stranger": "Hello, stranger!"
  },
  "foo": {
    "bar": {
      "baz": "Foo Bar Baz!"
    }
  },
  "test": ""
});
var t = createTranslator(getDocument, [NestedKeysPlugin]);
var tn = createDotNester(t);
export {
  createDotNester
};
