import { createFragment } from "./fragment";

function escapeColumn(column) {
  return column
    .split(".")
    .map(piece => `\`${piece}\``)
    .join(".");
}

export function select(...columns) {
  return createFragment(args => {
    return {
      wrap: columns => `SELECT ` + columns,
      combine: columnsets => columnsets.join(", "),
      serialize() {
        return columns.map(escapeColumn).join(", ");
      }
    };
  });
}
