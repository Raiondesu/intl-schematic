// packages/plugins/nested/src/dot.ts
var createDotNester = (t) => (keys) => {
  const [key, ...subkeys] = keys.split(".");
  return t(key, ...subkeys);
};
export {
  createDotNester
};
