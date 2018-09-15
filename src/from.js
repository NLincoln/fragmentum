import { createFragment } from "./fragment";
import { orderings } from "./ordering";
import { isExecutable, execute } from "./execute";
const IDENT = Symbol("from-ident");

function validateTable(table) {
  if (!isExecutable(table)) {
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
      ident: IDENT,
      ordering: orderings.from,
      wrap: tables => `FROM ${tables}`,
      combine: tables => tables.join(", "),
      serialize(repr) {
        return repr.tables.join(", ");
      },
      tables: tables.map(table => {
        return execute(table, args).query;
      })
    };
  });
}
