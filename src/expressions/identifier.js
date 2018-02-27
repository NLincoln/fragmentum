import Expression from "./expression";
import columnQuote from "../util/column-quote";

export default class Identifier extends Expression {
  constructor(name) {
    super();
    this.name = name;
  }
  serialize() {
    return {
      query: columnQuote(String(this.name)),
      binds: []
    };
  }
}
