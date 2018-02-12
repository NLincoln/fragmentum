import Expression from "./expression";
import Identifier from "./identifier";

export const Ops = {
  eq: Symbol()
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
    const serializeExpr = expr => {
      const serialized = expr.serialize();
      if (typeof serialized === "string") {
        return { query: serialized, binds: [] };
      } else if ("binds" in serialized) {
        return serialized;
      }
    };
    const lhs = serializeExpr(this.lhs);
    const rhs = serializeExpr(this.rhs);
    return {
      query: `${lhs.query} ${op} ${rhs.query}`,
      binds: lhs.binds.concat(rhs.binds)
    };
  }
}
export const eq = (lhs, rhs) => {
  const normalizeOperand = operand => {
    if (operand instanceof Expression) {
      return operand;
    } else {
      return new Identifier(operand);
    }
  };
  return new BinaryExpression(
    Ops.eq,
    normalizeOperand(lhs),
    normalizeOperand(rhs)
  );
};
