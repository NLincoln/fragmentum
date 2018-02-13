import Expression from "./expression";
import columnQuote from "../util/column";

export default class Identifier extends Expression {
  constructor(name) {
    super();
    this.name = name;
  }
  serialize() {
    return columnQuote(this.name);
  }
}
