import SelectFragment, { select } from "./fragments/select";
import FromFragment, { from, concatSubQueries } from "./fragments/from";
import WhereFragment, { where } from "./fragments/where";
import JoinFragment, { join } from "./fragments/join";

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
    const serialized = this.serializeFragment(SelectFragment).join(", ");
    if (serialized) {
      return `SELECT ${serialized}`;
    }
    return "";
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

  serialize(opts = {}) {
    let partial = Boolean(opts.partial);
    const columns = this.serializeColumns();
    const tables = this.serializeTables();
    const conditions = this.serializeConditions();
    const joins = this.serializeJoins();
    if (!columns || !tables.query) {
      partial = true;
    }
    let fragments = [
      columns,
      tables.query,
      joins.query,
      conditions.query
    ].filter(f => f);
    let semi = partial ? "" : ";";
    return {
      query: `${fragments.join(" ")}${semi}`,
      binds: conditions.binds.concat(tables.binds).concat(joins.binds)
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

export const builder = (...fragments) => new Builder(fragments);
