import Fragment from "./fragments/fragment";
import SelectFragment, { select } from "./fragments/select";
import FromFragment, { from } from "./fragments/from";
import WhereFragment, { where } from "./fragments/where";
import quote from "./util/quote";
import BinaryExpression, { Ops, eq } from "./expressions/binary-expression";
import { value } from "./expressions/raw-value";
import { bind } from "./expressions/bind";

export { eq, value, select, from, where, bind };

const builderFunc = fn =>
  function(...args) {
    return this.concat(fn(...args));
  };

class Builder {
  constructor(fragments) {
    this.fragments = fragments;
    this.select = builderFunc(select);
    this.where = builderFunc(where);
    this.from = builderFunc(from);
  }

  concat(...fragments) {
    return new Builder(this.fragments.concat(...fragments));
  }

  serialize() {
    const serializeFragment = (klass, joinStr) =>
      this.fragments
        .filter(fragment => fragment instanceof klass)
        .map(fragment => fragment.serialize())
        .join(joinStr);
    const columns = serializeFragment(SelectFragment, ", ");
    const tables = serializeFragment(FromFragment, ", ");
    let conditions = this.fragments
      .filter(fragment => fragment instanceof WhereFragment)
      .map(fragment => fragment.serialize());
    let binds = conditions
      .map(({ binds }) => binds)
      .reduce((prev, curr) => prev.concat(curr), []);
    let conditionsQuery = conditions.map(({ query }) => query).join(" AND ");
    if (conditionsQuery) {
      conditionsQuery = ` WHERE ${conditionsQuery}`;
    }
    return {
      query: `SELECT ${columns} FROM ${tables}${conditionsQuery};`,
      binds
    };
  }
}

export const builder = (...fragments) => new Builder(fragments);
