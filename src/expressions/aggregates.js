import Expression from "./expression";
import columnQuote from "../util/column";
import quote from "../util/quote";
import { concatSubQueries } from "../fragments/from";
import WindowExpression from "./window";

const serializeParam = arg => {
  if (arg instanceof Expression) {
    return arg.serialize();
  }
  return {
    query: columnQuote(arg),
    binds: []
  };
};

export default class AggregateFunctionExpression extends Expression {
  constructor(func, ...args) {
    super();
    this.func = func;
    this.args = args;
  }
  over() {
    /**
     * Let the aggregate function die away, reborn as a WindowExpression
     *
     * This is why immutability is cool.
     */
    return new WindowExpression(this);
  }
  serialize() {
    if (this.args.length === 0) {
      return {
        query: `${this.func}(*)`,
        binds: []
      };
    }
    return concatSubQueries(
      this.args.map(serializeParam).map(arg => {
        const { query, binds } = arg;
        return {
          query: `${this.func}(${query})`,
          binds
        };
      })
    );
  }
}

const makeAggregate = name => (...args) =>
  new AggregateFunctionExpression(name, ...args);

export const agg = {
  count: makeAggregate("COUNT"),
  sum: makeAggregate("SUM")
};
