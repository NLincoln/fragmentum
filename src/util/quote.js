const quoteType = sym => val => {
  if (val.startsWith(sym)) {
    return val;
  }
  return `${sym}${val.replace(sym, `\\${sym}`)}${sym}`;
};
const quoteSingle = quoteType(`'`);
const quoteDouble = quoteType(`"`);

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
    return quoteSingle(val);
  }
  if (opts.parens) {
    return `(${val})`;
  }
  return quoteDouble(val);
}
