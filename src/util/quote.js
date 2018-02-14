export default (val, opts = {}) => {
  if (val === "*") {
    return val;
  }
  if (opts.single) {
    return `'${val}'`;
  }
  if (opts.parens) {
    return `(${val})`;
  }
  return `"${val}"`;
};
