import { createFragment } from "./fragment";
import { serializeArgument, isArgument } from "./arg";
import { orderings } from "./ordering";

export function from(...tables) {
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
          return serializeArgument(args, table);
        }
        return table;
      })
    };
  });
}
