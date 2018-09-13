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
    repr: args => {
      return {
        type: types.select,
        columns,
        wrap: columns => `SELECT ` + columns,
        combine: columnsets => columnsets.join(", "),
        serialize() {
          return columns.map(escapeColumn).join(", ");
        }
      };
    }
  });
}
