import Expression from "./expression";
import wrap from "../util/function-constructor";

class Raw extends Expression {
  constructor(sql, binds) {
    super();
    this.sql = sql;
    this.binds = binds;
  }
  serialize() {
    return {
      query: this.sql,
      binds: this.binds
    };
  }
}

export const raw = wrap(Raw);
