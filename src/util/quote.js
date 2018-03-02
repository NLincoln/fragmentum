/**
 *
 * @param {String} val
 * @param {*} opts
 */
export default function quote(val, opts = {}) {
  if (val === "*") {
    return val;
  }
  if (opts.single) {
    if (val.startsWith(`'`)) {
      return val;
    }
    return `'${val.replace(`'`, `\\'`)}'`;
  }
  if (opts.parens) {
    return `(${val})`;
  }
  if (val.startsWith(`"`)) {
    return val;
  }
  return `"${val.replace(`"`, `\\"`)}"`;
}
