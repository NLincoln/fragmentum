import Fragment from "./fragment";
import { Builder } from "../builder";
import quote from "../util/quote";
import columnQuote from "../util/column-quote";
import Expression from "../expressions/expression";
import wrap from "../util/function-constructor";
import { concatQueries } from "../util/concat-queries";
import { serializeMaybeExpression } from "../util/serializeExpression";

export default class SelectFragment extends Fragment {
  constructor(...columns) {
    super();
    this.columns = columns;
  }
  clone() {
    return select(...this.columns);
  }
  serialize() {
    if (this.columns.length === 0) {
      return { query: "*", binds: [] };
    }
    return concatQueries(this.columns.map(serializeMaybeExpression));
  }
}
export const select = wrap(SelectFragment);
