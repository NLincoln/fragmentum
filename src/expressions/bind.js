import Expression from "./expression";
import wrap from "../util/function-constructor";

export default class Bind extends Expression {
  constructor(name, value) {
    super();
    this.name = name;
    this.value = value;
  }
  serialize() {
    return {
      binds: [
        {
          [this.name]: this.value
        }
      ],
      query: `:${this.name}`
    };
  }
}
export const bind = wrap(Bind);
