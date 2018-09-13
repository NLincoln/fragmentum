import { createFragment } from "./fragment";
import { types } from "./fragmentTypes";

function escapeColumn(column) {
  return column
    .split(".")
    .map(piece => `\`${piece}\``)
    .join(".");
}

export function select(...columns) {
  return createFragment(args => {
    return {
      type: types.select,
      columns,
      wrap: columns => `SELECT ` + columns,
      combine: columnsets => columnsets.join(", "),
      serialize() {
        return columns.map(escapeColumn).join(", ");
      }
    };
  });
}
