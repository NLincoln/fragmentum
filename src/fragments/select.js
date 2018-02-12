import Fragment from "./fragment";
import quote from "../util/quote";

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
        const serializeArray = ([key, alias]) => {
          if (key && alias) {
            return `${quote(key)} AS ${quote(alias)}`;
          }
          return quote(key);
        };
        if (Array.isArray(column)) {
          return serializeArray(column);
        } else if (typeof column === "object") {
          return Object.entries(column).map(serializeArray);
        }
        return quote(column);
      })
      .join(", ");
  }
}
export const select = (...columns) => new SelectFragment(columns);
