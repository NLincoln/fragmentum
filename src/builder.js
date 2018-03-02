import SelectFragment, { select } from "./fragments/select";
import FromFragment, { from } from "./fragments/from";
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
import { concatQueries } from "./util/concat-queries";
import SubQueryAliasFragment, {
  alias,
  softAlias
} from "./fragments/subquery-alias.js";

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

let aliasCounter = 0;

const getAliasGuid = () => {
  return aliasCounter++;
};

export class Builder {
  constructor(fragments) {
    // The first argument of our fragments array may be an alias.
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
    return new Builder(nextFragments);
  }

  serializeFragment(klass, prepend, joinStr = ", ") {
    let fragments = this.fragments.filter(
      fragment => fragment instanceof klass
    );
    // check if there are any alias's that are not marked as overridable
    const hardAliasFragments = fragments.filter(
      fragment => fragment.isOverridable === false
    );
    const softAliasFragments = fragments.filter(
      fragment => fragment.isOverridable === true
    );
    if (hardAliasFragments.length) {
      fragments = hardAliasFragments;
    } else {
      fragments = softAliasFragments;
    }
    const { query, binds } = concatQueries(
      fragments.map(fragment => fragment.serialize()),
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

  get alias() {
    const aliasFragments = this.fragments.filter(
      fragment => fragment instanceof SubQueryAliasFragment
    );
    if (aliasFragments.length === 0) {
      const aliasID = getAliasGuid();
      return `BUILDER_anonymous${aliasID}`;
    } else if (aliasFragments.length === 1) {
      return aliasFragments[0].serialize().query;
    } else {
      // check if there are any alias's that are not marked as overridable
      const hasHardAlias = aliasFragments.find(
        fragment => fragment.isOverridable === false
      );
      if (hasHardAlias) {
        return hasHardAlias.serialize().query;
      }
      // If there aren't any hard alias's, just take the first one.
      return aliasFragments[0].serialize().query;
    }
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
Builder.prototype.setAlias = builderFunc(alias);
Builder.prototype.softAlias = builderFunc(softAlias);

export const builder = (...fragments) => new Builder(fragments);
