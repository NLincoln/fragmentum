export default (val, opts = {}) => {
  if (opts.single) {
    return `'${val}'`;
  }
  if (opts.parens) {
    return `(${val})`;
  }
  return `"${val}"`;
};
