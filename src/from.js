import { createFragment, isFragment } from "./fragment";
import { serializeArgument, isArgument } from "./arg";
import { orderings } from "./ordering";

function validateTable(table) {
  if (
    !isFragment(table) &&
    !(typeof table === "string") &&
    !isArgument(table)
  ) {
    throw new Error(
      "`from`: You should have passed a fragment, string, or argument. I received " +
        table
    );
  }
  return table;
}

export function from(...tables) {
  /**
   * Validation
   */
  tables.forEach(validateTable);
  return createFragment(args => {
    return {
      ordering: orderings.from,
      wrap: tables => `FROM ${tables}`,
      combine: tables => tables.join(", "),
      serialize(repr) {
        return repr.tables.map(table => `\`${table}\``).join(", ");
      },
      tables: tables.map(table => {
        if (isArgument(table)) {
          return validateTable(serializeArgument(args, table));
        }
        return table;
      })
    };
  });
}
