import Fragment from "./fragment";
import quote from "../util/quote";
import columnQuote from "../util/column";
import Expression from "../expressions/expression";
import { concatSubQueries } from "./from";
import wrap from "../util/wrap";

const serializePair = ([key, alias]) => {
  if (key && alias) {
    return `${columnQuote(key)} AS ${quote(alias)}`;
  }
  return null;
};

const serializeObject = column =>
  Object.keys(column)
    .map(key => serializePair([key, column[key]]))
    .join(", ");

const serializeColumn = column => {
  if (Array.isArray(column)) {
    return serializePair(column);
  } else if (typeof column === "object") {
    return serializeObject(column);
  }
  return columnQuote(column);
};

export default class SelectFragment extends Fragment {
  constructor(...columns) {
    super();
    this.columns = columns;
  }
  serialize() {
    if (this.columns.length === 0) {
      return { query: "*", binds: [] };
    }
    return concatSubQueries(
      this.columns.map(column => {
        if (column instanceof Expression) {
          return column.serialize();
        }
        return {
          query: serializeColumn(column),
          binds: []
        };
      })
    );
  }
}
export const select = wrap(SelectFragment);
