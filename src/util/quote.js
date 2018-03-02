export default function quote(val, opts = {}) {
  if (val === "*") {
    return val;
  }
  if (opts.single) {
    return `'${val.replace(`'`, `\\'`)}'`;
  }
  if (opts.parens) {
    return `(${val})`;
  }
  return `"${val.replace(`"`, `\\"`)}"`;
}
