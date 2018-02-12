enum Ops {
  eq
}

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

abstract class Fragment {
  abstract serialize(): string;
}

class SelectFragment extends Fragment {
  constructor(private columns: Array<string>) {
    super();
  }
  serialize() {
    if (this.columns.length === 0) {
      return "*";
    } else {
      return this.columns.map(column => `"${column}"`).join(", ");
    }
  }
}

class FromFragment extends Fragment {
  constructor(private table: string) {
    super();
  }
  serialize() {
    return `"${this.table}"`;
  }
}

class WhereFragment extends Fragment {
  constructor(private expr: Expression) {
    super();
  }
  serialize() {
    return this.expr.serialize();
  }
}

export const select = (...columns: Array<string>) =>
  new SelectFragment(columns);

export const from = (table: string) => new FromFragment(table);

export const where = (expr: Expression) => new WhereFragment(expr);

export class Builder {
  constructor(private fragments: Array<Fragment> = []) {}
  select(...columns: Array<string>) {
    return new Builder(this.fragments.concat(select(...columns)));
  }
  from(table: string) {
    return new Builder(this.fragments.concat(from(table)));
  }
  serialize(): string {
    const columnFragments = this.fragments.filter(
      fragment => fragment instanceof SelectFragment
    );
    const tableFragments = this.fragments.filter(
      fragment => fragment instanceof FromFragment
    );
    const conditionFragments = this.fragments.filter(
      fragment => fragment instanceof WhereFragment
    );

    const serializeFragments = (
      fragments: Array<Fragment>,
      joinStr: string
    ): string => fragments.map(fragment => fragment.serialize()).join(joinStr);

    const columns = serializeFragments(columnFragments, ", ");
    const tables = serializeFragments(tableFragments, ", ");
    let conditions = serializeFragments(conditionFragments, " AND ");
    if (conditions) {
      conditions = ` WHERE ${conditions}`;
    }
    return `SELECT ${columns} FROM ${tables}${conditions};`;
  }
}
