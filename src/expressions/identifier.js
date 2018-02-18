import Expression from "./expression";
import columnQuote from "../util/column-quote";

export default class Identifier extends Expression {
  constructor(name) {
    super();
    this.name = name;
  }
  serialize() {
    return columnQuote(String(this.name));
  }
}
