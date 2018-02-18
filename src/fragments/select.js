import Fragment from "./fragment";
import quote from "../util/quote";
import columnQuote from "../util/column-quote";
import Expression from "../expressions/expression";
import wrap from "../util/function-constructor";
import { concatQueries } from "../util/concat-queries";

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
export const serializeMaybeExpression = serializeColumn => column => {
  if (column instanceof Expression) {
    return column.serialize();
  }
  return {
    query: serializeColumn(column),
    binds: []
  };
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
    return concatQueries(
      this.columns.map(serializeMaybeExpression(serializeColumn))
    );
  }
}
export const select = wrap(SelectFragment);
