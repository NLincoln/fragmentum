import Expression from "./expression";
import Identifier from "./identifier";
import { Builder } from "../builder";
import FromFragment from "../fragments/from";
import quote from "../util/quote";
import { concatQueries } from "../util/concat-queries";

const binaryOps = {
  eq: Symbol(),
  ne: Symbol(),
  lt: Symbol(),
  lte: Symbol(),
  gt: Symbol(),
  gte: Symbol(),
  shiftLeft: Symbol(),
  shiftRight: Symbol(),
  in: Symbol()
};

const associativeOps = {
  add: Symbol(),
  sub: Symbol(),
  div: Symbol(),
  mult: Symbol(),
  xor: Symbol(),
  and: Symbol(),
  or: Symbol()
};

const serializeExpr = expr => {
  if (expr instanceof Builder || expr instanceof FromFragment) {
    const serialized = expr.serialize({ partial: true });

    return {
      ...serialized,
      query: quote(serialized.query, { parens: true })
    };
  } else if (Array.isArray(expr)) {
    const { query, binds } = concatQueries(expr.map(serializeExpr));
    return {
      query: quote(query, { parens: true }),
      binds
    };
  }
  const serialized = expr.serialize({ partial: true });
  return serialized;
};

export default class BinaryExpression extends Expression {
  constructor(op, ...args) {
    super();
    this.isBinaryOp = Object.keys(binaryOps).some(key => binaryOps[key] === op);
    this.isAssociativeOp = Object.keys(associativeOps).some(
      key => associativeOps[key] === op
    );

    this.op = op;
    if (this.isBinaryOp) {
      this.lhs = args[0];
      this.rhs = args[1];
    } else {
      this.args = args;
    }
  }
  serializeBinaryOp() {
    const op = {
      [binaryOps.eq]: "=",
      [binaryOps.gt]: ">",
      [binaryOps.lt]: "<",
      [binaryOps.lte]: "<=",
      [binaryOps.ne]: "!=",
      [binaryOps.gte]: ">=",
      [binaryOps.shiftLeft]: "<<",
      [binaryOps.shiftRight]: ">>",
      [binaryOps.in]: "IN"
    }[this.op];
    const lhs = serializeExpr(this.lhs);
    const rhs = serializeExpr(this.rhs);
    return {
      query: quote(`${lhs.query} ${op} ${rhs.query}`, { parens: true }),
      binds: lhs.binds.concat(rhs.binds)
    };
  }
  serializeAssociativeOp() {
    const op = {
      [associativeOps.add]: "+",
      [associativeOps.sub]: "-",
      [associativeOps.div]: "/",
      [associativeOps.mult]: "*",
      [associativeOps.xor]: "#",
      [associativeOps.and]: "&",
      [associativeOps.or]: "|"
    }[this.op];

    const exprs = concatQueries(this.args.map(serializeExpr), ` ${op} `);
    return {
      query: quote(exprs.query, { parens: true }),
      binds: exprs.binds
    };
  }
  serialize() {
    if (this.isBinaryOp) {
      return this.serializeBinaryOp();
    } else {
      return this.serializeAssociativeOp();
    }
  }
}

const normalizeOperand = operand => {
  if (operand instanceof Expression || operand instanceof Builder) {
    return operand;
  } else if (Array.isArray(operand)) {
    return operand.map(normalizeOperand);
  } else {
    return new Identifier(operand);
  }
};

const makeBinaryOp = symbol => (lhs, rhs) =>
  new BinaryExpression(symbol, normalizeOperand(lhs), normalizeOperand(rhs));

const makeAssociativeOp = symbol => (...args) =>
  new BinaryExpression(symbol, ...args.map(normalizeOperand));

export const ops = {
  eq: makeBinaryOp(binaryOps.eq),
  ne: makeBinaryOp(binaryOps.ne),
  lt: makeBinaryOp(binaryOps.lt),
  lte: makeBinaryOp(binaryOps.lte),
  gt: makeBinaryOp(binaryOps.gt),
  gte: makeBinaryOp(binaryOps.gte),

  bit: {
    and: makeAssociativeOp(associativeOps.and),
    or: makeAssociativeOp(associativeOps.or),
    xor: makeAssociativeOp(associativeOps.xor),
    shiftLeft: makeBinaryOp(binaryOps.shiftLeft),
    shiftRight: makeBinaryOp(binaryOps.shiftRight)
  },
  add: makeAssociativeOp(associativeOps.add),
  sub: makeAssociativeOp(associativeOps.sub),
  div: makeAssociativeOp(associativeOps.div),
  mult: makeAssociativeOp(associativeOps.mult),
  in: makeBinaryOp(binaryOps.in)
};
