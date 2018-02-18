import Fragment from "./fragment";
import columnQuote from "../util/column-quote";
import wrap from "../util/function-constructor";

export default class GroupByFragment extends Fragment {
  constructor(...columns) {
    super();
    this.columns = columns;
  }
  serialize() {
    return {
      query: this.columns.map(columnQuote).join(", "),
      binds: []
    };
  }
}

export const groupBy = wrap(GroupByFragment);
