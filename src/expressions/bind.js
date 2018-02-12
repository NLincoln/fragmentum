import Expression from "./expression";

export default class Bind extends Expression {
  constructor(name, value) {
    super();
    this.name = name;
    this.value = value;
  }
  serialize() {
    return {
      binds: [{ [this.name]: this.value }],
      query: `:${this.name}`
    };
  }
}
export const bind = (...args) => new Bind(...args);
