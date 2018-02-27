import Expression from "./expression";
import Identifier from "./identifier";
import OrderByFragment from "../fragments/order-by";

export default class WindowExpression extends Expression {
  constructor(aggregate, extra) {
    super();
    this.aggregate = aggregate;
    this.extra = extra || {};
  }
  cloneWith(args) {
    return new WindowExpression(this.aggregate, {
      ...this.extra,
      ...args
    });
  }
  partition(column) {
    return this.cloneWith({
      partition: new Identifier(column)
    });
  }
  orderBy(...args) {
    return this.cloneWith({
      orderBy: new OrderByFragment(...args)
    });
  }

  serializeExtra(val, prepend) {
    if (!val) {
      return {
        query: null,
        binds: []
      };
    }
    const { query, binds } = val.serialize();

    return {
      query: `${prepend}${query}`,
      binds
    };
  }

  serialize() {
    const aggregate = this.aggregate.serialize();
    const partition = this.serializeExtra(
      this.extra.partition,
      "PARTITION BY "
    );
    const orderBy = this.serializeExtra(this.extra.orderBy, "ORDER BY ");

    const query = [partition.query, orderBy.query].filter(f => f).join(" ");
    const binds = [...partition.binds, ...aggregate.binds, ...orderBy.binds];
    return {
      query: `${aggregate.query} OVER (${query})`,
      binds
    };
  }
}
