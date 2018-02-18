import SelectFragment, { select } from "./fragments/select";
import FromFragment, { from, concatSubQueries } from "./fragments/from";
import WhereFragment, { where } from "./fragments/where";
import JoinFragment, { join } from "./fragments/join";
import LimitFragment, { limit } from "./fragments/limit";
import OffsetFragment, { offset } from "./fragments/offset";
import OrderByFragment, { orderBy } from "./fragments/order-by";
import GroupByFragment, { groupBy } from "./fragments/group-by";

export class Builder {
  constructor(fragments) {
    // The first argument of our fragments array may be an alias.
    if (typeof fragments[0] === "string") {
      this.alias = fragments[0];
      fragments = fragments.slice(1);
    } else {
      this.alias = null;
    }
    fragments = fragments
      .map(fragment => {
        if (fragment instanceof Builder) {
          return fragment.fragments;
        } else {
          return fragment;
        }
      })
      .reduce((prev, curr) => prev.concat(curr), []);
    this.fragments = fragments;
  }

  concat(...fragments) {
    let nextFragments = this.fragments.concat(...fragments);
    if (this.alias) {
      nextFragments.unshift(this.alias);
    }
    return new Builder(nextFragments);
  }
  serializeFragment(klass) {
    return this.fragments
      .filter(fragment => fragment instanceof klass)
      .map(fragment => fragment.serialize())
      .filter(f => (typeof f === "object" && f.query) || f);
  }

  serializeColumns() {
    let { query, binds } = concatSubQueries(
      this.serializeFragment(SelectFragment)
    );
    if (query) {
      query = `SELECT ${query}`;
      return { query, binds };
    }
    return { query: "", binds: [] };
  }
  serializeTables() {
    let { query, binds } = concatSubQueries(
      this.serializeFragment(FromFragment)
    );
    if (query) {
      query = `FROM ${query}`;
    }
    return { query, binds };
  }
  serializeConditions() {
    let conditions = this.fragments
      .filter(fragment => fragment instanceof WhereFragment)
      .map(fragment => fragment.serialize());
    let binds = conditions
      .map(({ binds }) => binds)
      .reduce((prev, curr) => prev.concat(curr), []);
    let conditionsQuery = conditions.map(({ query }) => query).join(" AND ");
    if (conditionsQuery) {
      return {
        query: `WHERE ${conditionsQuery}`,
        binds
      };
    }
    return {
      query: "",
      binds: []
    };
  }

  serializeJoins() {
    return concatSubQueries(this.serializeFragment(JoinFragment), " ");
  }

  serializeLimit() {
    return concatSubQueries(this.serializeFragment(LimitFragment), " ");
  }

  serializeOffsets() {
    return concatSubQueries(this.serializeFragment(OffsetFragment), " ");
  }

  serializeOrderBy() {
    const { query, binds } = concatSubQueries(
      this.serializeFragment(OrderByFragment)
    );
    if (!query) {
      return { query, binds };
    }
    return {
      query: `ORDER BY ${query}`,
      binds
    };
  }
  serializeGroupBy() {
    const { query, binds } = concatSubQueries(
      this.serializeFragment(GroupByFragment)
    );
    if (!query) {
      return { query, binds };
    }
    return {
      query: `GROUP BY ${query}`,
      binds
    };
  }
  serialize(opts = {}) {
    let partial = Boolean(opts.partial);
    const columns = this.serializeColumns();
    const tables = this.serializeTables();
    const conditions = this.serializeConditions();
    const joins = this.serializeJoins();
    const limits = this.serializeLimit();
    const offsets = this.serializeOffsets();
    const groupBys = this.serializeGroupBy();
    const orderBys = this.serializeOrderBy();

    if (!columns.query || !tables.query) {
      partial = true;
    }
    let fragments = [
      columns.query,
      tables.query,
      joins.query,
      conditions.query,
      groupBys.query,
      orderBys.query,
      limits.query,
      offsets.query
    ].filter(f => f);
    let semi = partial ? "" : ";";
    return {
      query: `${fragments.join(" ")}${semi}`,
      binds: Object.assign(
        {},
        ...columns.binds,
        ...conditions.binds,
        ...groupBys.binds,
        ...tables.binds,
        ...joins.binds,
        ...limits.binds,
        ...offsets.binds,
        ...orderBys.binds
      )
    };
  }
}
const builderFunc = fn =>
  function(...args) {
    return this.concat(fn(...args));
  };

Builder.prototype.select = builderFunc(select);
Builder.prototype.where = builderFunc(where);
Builder.prototype.from = builderFunc(from);
Builder.prototype.join = builderFunc(join);
Builder.prototype.limit = builderFunc(limit);
Builder.prototype.offset = builderFunc(offset);
Builder.prototype.orderBy = builderFunc(orderBy);
Builder.prototype.groupBy = builderFunc(groupBy);

export const builder = (...fragments) => new Builder(fragments);
