import Fragment from "./fragment";
import wrap from "../util/wrap";
import columnQuote from "../util/column";

export default class OrderByFragment extends Fragment {
  constructor(...columns) {
    super();
    this.columns = columns;
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
