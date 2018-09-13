import { createFragment } from "./createFragment";
import { types } from "./fragmentTypes";

function escapeColumn(column) {
  return column
    .split(".")
    .map(piece => `\`${piece}\``)
    .join(".");
}

export function select(...columns) {
  return createFragment({
    type: types.select,
    wrap: columns => `SELECT ` + columns,
    combine: columnsets => columnsets.join(", "),
    serialize(args) {
      return columns.map(escapeColumn).join(", ");
    }
  });
}
