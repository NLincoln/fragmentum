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

export const value = (value: string | number) => new RawValue(value);

export const eq = (lhs: Expression | string, rhs: Expression | string) => {
  const normalizeOperand = (operand: Expression | string): Expression => {
    if (operand instanceof Expression) {
      return operand;
    } else {
      return new Identifier(operand);
    }
  };
  return new BinaryExpression(
    Ops.eq,
    normalizeOperand(lhs),
    normalizeOperand(rhs)
  );
};

abstract class Expression {
  abstract clone(): Expression;
  abstract serialize(): string;
}

class Identifier extends Expression {
  constructor(private name: string) {
    super();
  }
  serialize() {
    return `"${this.name}"`;
  }
  clone() {
    return new Identifier(this.name);
  }
}

class RawValue extends Expression {
  constructor(private value: string | number) {
    super();
  }
  serialize() {
    return `'${this.value}'`;
  }
  clone() {
    return new RawValue(this.value);
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
  serialize() {
    const op = {
      [Ops.eq]: "="
    }[this.op];
    return `${this.lhs.serialize()} ${op} ${this.rhs.serialize()}`;
  }
  clone() {
    return new BinaryExpression(this.op, this.lhs.clone(), this.rhs.clone());
  }
}

export class Builder {
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
  serialize() {
    const where = this._conditions
      ? ` WHERE ${this._conditions.serialize()}`
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
