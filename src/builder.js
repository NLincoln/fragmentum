import SelectFragment, { select } from "./fragments/select";
import FromFragment, { from, concatSubQueries } from "./fragments/from";
import WhereFragment, { where } from "./fragments/where";
import JoinFragment, { join } from "./fragments/join";
import {
  LimitFragment,
  OffsetFragment,
  limit,
  offset
} from "./fragments/limit";
import OrderByFragment, { orderBy } from "./fragments/order-by";
import GroupByFragment, { groupBy } from "./fragments/group-by";
import HavingFragment, { having } from "./fragments/having";

const serializeQuery = fragments =>
  fragments
    .map(fragment => fragment.query)
    .filter(f => f)
    .join(" ");
const serializeBinds = fragments =>
  Object.assign(
    {},
    ...fragments
      .map(fragment => fragment.binds)
      .reduce((prev, curr) => prev.concat(curr), [])
  );

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
  serializeFragment(klass, prepend, joinStr = ", ") {
    const { query, binds } = concatSubQueries(
      this.fragments
        .filter(fragment => fragment instanceof klass)
        .map(fragment => fragment.serialize()),
      joinStr
    );
    if (query && prepend) {
      return {
        query: `${prepend} ${query}`,
        binds
      };
    }
    return { query, binds };
  }

  serialize(opts = {}) {
    let partial = Boolean(opts.partial);
    let fragments = [
      this.serializeFragment(SelectFragment, "SELECT"),
      this.serializeFragment(FromFragment, "FROM"),
      this.serializeFragment(WhereFragment, "WHERE"),
      this.serializeFragment(JoinFragment, null, " "),
      this.serializeFragment(GroupByFragment, "GROUP BY", ", "),
      this.serializeFragment(HavingFragment, "HAVING", " AND "),
      this.serializeFragment(OrderByFragment, "ORDER BY", ", "),
      this.serializeFragment(LimitFragment, null, " "),
      this.serializeFragment(OffsetFragment, null, " ")
    ];
    const [columns, tables] = fragments;
    if (!columns.query || !tables.query) {
      partial = true;
    }
    let semi = partial ? "" : ";";
    const query = serializeQuery(fragments);
    const binds = serializeBinds(fragments);
    return {
      query: `${query}${semi}`,
      binds
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
Builder.prototype.having = builderFunc(having);
export const builder = (...fragments) => new Builder(fragments);
