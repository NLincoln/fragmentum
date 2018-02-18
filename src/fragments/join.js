import Fragment from "./fragment";
import BinaryExpression, { ops } from "../expressions/binary-expression";
import wrap from "../util/function-constructor";
import quote from "../util/quote";
import { serializeTable } from "./from";

export default class JoinFragment extends Fragment {
  constructor(table, lhs, rhs) {
    super();
    this.table = serializeTable(table);
    if (lhs instanceof BinaryExpression) {
      this.on = lhs;
    } else {
      this.on = ops.eq(lhs, rhs);
    }
    this.on = this.on.serialize();
  }
  serialize() {
    return {
      query: `INNER JOIN ${this.table.query} ON ${this.on.query}`,
      binds: this.on.binds.concat(this.table.binds)
    };
  }
}

export const join = wrap(JoinFragment);
