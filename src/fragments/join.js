import Fragment from "./fragment";
import BinaryExpression, { ops } from "../expressions/binary-expression";
import wrap from "../util/function-constructor";
import quote from "../util/quote";
import { serializeMaybeExpression } from "../util/serializeExpression";

export default class JoinFragment extends Fragment {
  constructor(type, table, lhs, rhs) {
    super();
    this.type = type;
    this.table = table;
    this.lhs = lhs;
    this.rhs = rhs;
  }
  clone() {
    return new JoinFragment(this.type, this.table, this.lhs, this.rhs);
  }
  serialize() {
    const table = serializeMaybeExpression(this.table);
    const on = (this.lhs instanceof BinaryExpression
      ? this.lhs
      : ops.eq(this.lhs, this.rhs)
    ).serialize();

    return {
      query: `${this.type} JOIN ${table.query} ON ${on.query}`,
      binds: on.binds.concat(table.binds)
    };
  }
}

export const join = (...args) => new JoinFragment("INNER", ...args);
join.inner = join;
join.right = (...args) => new JoinFragment("RIGHT", ...args);
join.left = (...args) => new JoinFragment("LEFT", ...args);
join.outer = (...args) => new JoinFragment("OUTER", ...args);
