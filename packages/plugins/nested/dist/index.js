// src/index.ts
import { createPlugin } from "intl-schematic/plugins";
function match(value) {
  return !!value && typeof value === "object" && Object.values(value).some(match);
}
var NestedKeysPlugin = createPlugin("NestedKeys", match, {
  translate(...path) {
    const result = path.reduce((branch, leaf, index) => typeof branch === "string" || typeof branch === "undefined" ? branch : leaf in branch ? branch[leaf] : console.log(path.slice(0, index + 1).concat([JSON.stringify(branch)]).join(".")), this.value);
    if (typeof result === "string") {
      return result;
    }
  }
});
export {
  NestedKeysPlugin
};
