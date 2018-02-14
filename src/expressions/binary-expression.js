import Expression from "./expression";
import Identifier from "./identifier";
import { Builder } from "../builder";
import FromFragment from "../fragments/from";
import quote from "../util/quote";

export const Ops = {
  eq: Symbol()
};
const serializeExpr = expr => {
  const serialized = expr.serialize({ partial: true });
  if (expr instanceof Builder || expr instanceof FromFragment) {
    return {
      ...serialized,
      query: quote(serialized.query, { parens: true })
    };
  }
  if (typeof serialized === "object" && "binds" in serialized) {
    return serialized;
  }
  return { query: serialized, binds: [] };
};

export default class BinaryExpression extends Expression {
  constructor(op, lhs, rhs) {
    super();
    this.op = op;
    this.lhs = lhs;
    this.rhs = rhs;
  }
  serialize() {
    const op = {
      [Ops.eq]: "="
    }[this.op];
    const lhs = serializeExpr(this.lhs);
    const rhs = serializeExpr(this.rhs);
    return {
      query: `${lhs.query} ${op} ${rhs.query}`,
      binds: lhs.binds.concat(rhs.binds)
    };
  }
}

const normalizeOperand = operand => {
  if (operand instanceof Expression || operand instanceof Builder) {
    return operand;
  } else {
    return new Identifier(operand);
  }
};

export const eq = (lhs, rhs) => {
  return new BinaryExpression(
    Ops.eq,
    normalizeOperand(lhs),
    normalizeOperand(rhs)
  );
};
