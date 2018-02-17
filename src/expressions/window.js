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

  serializePartition() {
    if (!this.extra.partition) {
      return null;
    }
    return `PARTITION BY ${this.extra.partition.serialize()}`;
  }

  serializeOrderBy() {
    if (!this.extra.orderBy) {
      return {
        query: null,
        binds: []
      };
    }
    const { query, binds } = this.extra.orderBy.serialize();
    return {
      query: `ORDER BY ${query}`,
      binds
    };
  }

  serialize() {
    const aggregate = this.aggregate.serialize();
    const partition = this.serializePartition();
    const orderBy = this.serializeOrderBy();

    const query = [partition, orderBy.query].filter(f => f).join(" ");
    const binds = [...aggregate.binds, ...orderBy.binds];
    return {
      query: `${aggregate.query} OVER (${query})`,
      binds
    };
  }
}
