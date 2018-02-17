import Fragment from "./fragment";
import quote from "../util/quote";
import columnQuote from "../util/column";
import Expression from "../expressions/expression";
import { concatSubQueries } from "./from";

const serializePair = ([key, alias]) => {
  if (key && alias) {
    return `${columnQuote(key)} AS ${quote(alias)}`;
  }
  return null;
};

export default class SelectFragment extends Fragment {
  constructor(columns) {
    super();
    this.columns = columns;
  }
  serialize() {
    if (this.columns.length === 0) {
      return { query: "*", binds: [] };
    }
    return concatSubQueries(
      this.columns
        .map(column => {
          if (column instanceof Expression) {
            return column.serialize();
          }
          let query;
          if (Array.isArray(column)) {
            query = serializePair(column);
          } else if (typeof column === "object") {
            query = Object.keys(column)
              .map(key => serializePair([key, column[key]]))
              .join(", ");
          } else {
            query = columnQuote(column);
          }
          return {
            query,
            binds: []
          };
        })
        .filter(f => f.query)
    );
  }
}
export const select = (...columns) => new SelectFragment(columns);
