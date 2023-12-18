// src/index.ts
import { createPlugin } from "intl-schematic/plugins";
function match(value) {
  return typeof value === "function";
}
var FunctionsPlugin = createPlugin("Functions", match, {
  translate(...args) {
    return this.value(...args);
  }
});
export {
  FunctionsPlugin
};
