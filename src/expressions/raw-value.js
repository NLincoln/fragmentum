import Expression from "./expression";
import quote from "../util/quote";
import wrap from "../util/function-constructor";

export default class RawValue extends Expression {
  constructor(value) {
    super();
    this.value = value;
  }
  serialize() {
    return quote(String(this.value), { single: true });
  }
}

export const rawValue = wrap(RawValue);
