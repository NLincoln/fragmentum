import Fragment from "./fragment";
import wrap from "../util/function-constructor";
import columnQuote from "../util/column-quote";

export default class OrderByFragment extends Fragment {
  constructor(...columns) {
    super();
    this.columns = columns;
  }
  clone() {
    return orderBy(...this.columns);
  }
  serialize() {
    const query = this.columns
      .map(column => {
        if (Array.isArray(column)) {
          return `${columnQuote(column[0])} ${column[1] || "ASC"}`;
        } else {
          return `${columnQuote(column)} ASC`;
        }
      })
      .join(", ");
    return {
      query,
      binds: []
    };
  }
}

export const orderBy = wrap(OrderByFragment);
