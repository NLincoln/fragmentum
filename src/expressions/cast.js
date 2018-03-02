import Expression from "./expression";
import Identifier from "./identifier";
import wrap from "../util/function-constructor";

export default class CastExpression extends Expression {
  constructor(value, type) {
    super();
    this.value = value;
    this.type = type;
  }
  serialize() {
    const value = (typeof this.value === "string"
      ? new Identifier(this.value)
      : this.value
    ).serialize();
    return {
      query: `CAST(${value.query} AS ${this.type})`,
      binds: value.binds
    };
  }
}

export const cast = wrap(CastExpression);

Expression.prototype.cast = function(type) {
  return cast(this, type);
};
