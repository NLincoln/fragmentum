import Expression from "./expression";
import quote from "../util/quote";

export default class RawValue extends Expression {
  constructor(value) {
    super();
    this.value = value;
  }
  serialize() {
    return quote(this.value, { single: true });
  }
}
export const value = value => new RawValue(value);
