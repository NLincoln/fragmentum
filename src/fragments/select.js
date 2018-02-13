import Fragment from "./fragment";
import quote from "../util/quote";
import columnQuote from "../util/column";

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
      return "*";
    }
    return this.columns
      .map(column => {
        if (Array.isArray(column)) {
          return serializePair(column);
        } else if (typeof column === "object") {
          return Object.entries(column).map(serializePair);
        }
        return columnQuote(column);
      })
      .reduce((prev, curr) => prev.concat(curr), [])
      .filter(f => f)
      .join(", ");
  }
}
export const select = (...columns) => new SelectFragment(columns);
