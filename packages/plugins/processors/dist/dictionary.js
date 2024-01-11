// packages/plugins/processors/src/dictionary.ts
var dictionary = () => (options, key) => (input) => {
  const _input = typeof input === "string" ? { key: input, fallback: key } : {
    fallback: ("default" in input ? input.default : "fallback" in input ? input.fallback : void 0) ?? key,
    key: ("key" in input ? input.key : "value" in input ? input.value : "") ?? ""
  };
  try {
    return options && _input.key in options ? options[_input.key] : String(_input.fallback) ?? key;
  } catch (error) {
    return String(_input.fallback) ?? key;
  }
};
export {
  dictionary
};
