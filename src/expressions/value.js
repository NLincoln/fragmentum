import Expression from "./expression";
import { bind } from "./bind";
import wrap from "../util/function-constructor";

let GLOBAL_BIND_COUNTER = 0;

export default class ValueExpression extends Expression {
  constructor(value) {
    super();
    this.value = value;
  }
  serialize() {
    return bind(
      `fragmentumBindKey__PRIVATE${GLOBAL_BIND_COUNTER++}`,
      this.value
    ).serialize();
  }
}

export const value = wrap(ValueExpression);
