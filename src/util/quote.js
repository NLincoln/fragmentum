export default (val, opts = {}) => {
  if (opts.single) {
    return `'${val}'`;
  }
  return `"${val}"`;
};
