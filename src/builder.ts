enum Ops {
  eq
}

const serializeColumns = (columns: Array<string>) => {
  if (columns.length === 0) {
    return "*";
  } else {
    return columns.map(column => `"${column}"`).join(", ");
  }
};

export const value = (value: string) => new RawValue(value);

export const eq = (lhs: Expression | string, rhs: Expression | string) => {
  const normalizeOperand = (operand: Expression | string): Expression => {
    if (typeof operand === "string") {
      return new Identifier(operand);
    } else {
      return operand;
    }
  };
  return new BinaryExpression(
    Ops.eq,
    normalizeOperand(lhs),
    normalizeOperand(rhs)
  );
};

class Value {
  constructor(private _value: string | number) {}
}

abstract class Expression {
  abstract clone(): Expression;
  abstract toString(): string;
}

class Identifier extends Expression {
  constructor(private name: string) {
    super();
  }
  toString() {
    return `"${this.name}"`;
  }
  clone() {
    return this;
  }
}

class RawValue extends Expression {
  constructor(private value: string) {
    super();
  }
  toString() {
    return `'${this.value}'`;
  }
  clone() {
    return this;
  }
}

class BinaryExpression extends Expression {
  constructor(
    private op: Ops,
    private lhs: Expression,
    private rhs: Expression
  ) {
    super();
  }
  toString() {
    const op = {
      [Ops.eq]: "="
    }[this.op];
    return `${this.lhs.toString()} ${op} ${this.rhs.toString()}`;
  }
  clone() {
    return new BinaryExpression(this.op, this.lhs.clone(), this.rhs.clone());
  }
}

class Builder {
  private _columns: Array<string> = [];
  private _conditions: Expression | null = null;
  private _table: string | null = null;
  constructor() {}
  columns(columns: Array<string>) {
    const clone = this.clone();
    clone._columns = this._columns.concat(columns);
    return clone;
  }
  from(table: string) {
    const clone = this.clone();
    clone._table = table;
    return clone;
  }
  where(conditions: Expression) {
    const clone = this.clone();

    clone._conditions = conditions;
    return clone;
  }
  toString() {
    const where = this._conditions
      ? ` WHERE ${this._conditions.toString()}`
      : "";

    return `SELECT ${serializeColumns(this._columns)} FROM "${
      this._table
    }"${where};`;
  }
  clone() {
    const builder = new Builder();
    builder._columns = Array.from(this._columns);
    builder._conditions = this._conditions && this._conditions.clone();
    builder._table = this._table;
    return builder;
  }
}

export const select = (...columns: Array<string>) => {
  const builder = new Builder();
  return builder.columns(columns);
};
