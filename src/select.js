import { createFragment } from "./fragment";
import { execute } from "./execute";
import { orderings } from "./ordering";
const IDENT = Symbol("select-ident");

export function select(...columns) {
  return createFragment(args => {
    columns = columns.map(column => {
      return execute(column, args).query;
    });
    return {
      ident: IDENT,
      ordering: orderings.select,
      wrap: columns => `SELECT ` + columns,
      combine: columnsets => columnsets.join(", "),
      serialize() {
        return columns.join(", ");
      }
    };
  });
}
