import Expression from "./expression";
import quote from "../util/quote";

export default class Identifier extends Expression {
  constructor(name) {
    super();
    this.name = name;
  }
  serialize() {
    return quote(this.name);
  }
}
