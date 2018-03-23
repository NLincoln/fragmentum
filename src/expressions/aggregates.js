import Expression from "./expression";
import quote from "../util/quote";
import WindowExpression from "./window";
import { concatQueries } from "../util/concat-queries";
import { serializeMaybeExpression } from "../util/serializeExpression";

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
    return concatQueries(
      this.args.map(serializeMaybeExpression).map(arg => {
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
