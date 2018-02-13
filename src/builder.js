import SelectFragment, { select } from "./fragments/select";
import FromFragment, { from } from "./fragments/from";
import WhereFragment, { where } from "./fragments/where";
import quote from "./util/quote";
import BinaryExpression, { Ops, eq } from "./expressions/binary-expression";
import { value } from "./expressions/raw-value";
import { bind } from "./expressions/bind";

export { eq, value, select, from, where, bind };

class Builder {
  constructor(fragments) {
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
    return new Builder(this.fragments.concat(...fragments));
  }
  serializeFragment(klass, joinStr) {
    return this.fragments
      .filter(fragment => fragment instanceof klass)
      .map(fragment => fragment.serialize())
      .join(joinStr);
  }

  serializeColumns() {
    const serialized = this.serializeFragment(SelectFragment, ", ");
    if (serialized) {
      return `SELECT ${serialized}`;
    }
    return "";
  }
  serializeTables() {
    const tables = this.serializeFragment(FromFragment, ", ");
    if (tables) {
      return `FROM ${tables}`;
    }
    return "";
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
        conditions: `WHERE ${conditionsQuery}`,
        binds
      };
    }
    return {
      conditions: "",
      binds: []
    };
  }

  serialize(opts = {}) {
    let partial = Boolean(opts.partial);
    const columns = this.serializeColumns();
    const tables = this.serializeTables();
    const { conditions, binds } = this.serializeConditions();
    if (!columns || !tables) {
      partial = true;
    }
    let fragments = [columns, tables, conditions].filter(f => f);
    let semi = partial ? "" : ";";
    return {
      query: `${fragments.join(" ")}${semi}`,
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

export const builder = (...fragments) => new Builder(fragments);
