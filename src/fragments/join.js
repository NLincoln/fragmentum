import Fragment from "./fragment";
import BinaryExpression, { ops } from "../expressions/binary-expression";
import wrap from "../util/function-constructor";
import quote from "../util/quote";
import { serializeTable } from "./from";

export default class JoinFragment extends Fragment {
  constructor(table, lhs, rhs) {
    super();
    this.table = table;
    this.lhs = lhs;
    this.rhs = rhs;
  }
  clone() {
    return join(this.table, this.lhs, this.rhs);
  }
  serialize() {
    const table = serializeTable(this.table);
    const on = (this.lhs instanceof BinaryExpression
      ? this.lhs
      : ops.eq(this.lhs, this.rhs)
    ).serialize();

    return {
      query: `INNER JOIN ${table.query} ON ${on.query}`,
      binds: on.binds.concat(table.binds)
    };
  }
}

export const join = wrap(JoinFragment);
