import Expression from "./expression";
import wrap from "../util/function-constructor";
import { rawValue } from "./raw-value";
import { concatQueries } from "../util/concat-queries.js";

class FunctionCallExpression extends Expression {
  constructor(name, ...values) {
    super();
    this.name = name;
    this.values = values;
  }
  serialize() {
    const args = concatQueries(
      this.values
        .map(val => {
          if (typeof val === "string" || typeof val === "number") {
            return rawValue(val);
          }
          return val;
        })
        .map(val => val.serialize()),
      ", "
    );

    return {
      query: `${this.name}(${args.query})`,
      binds: args.binds
    };
  }
}

export const func = wrap(FunctionCallExpression);
