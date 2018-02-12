const Ops = {
  eq: Symbol()
};

export const value = value => new RawValue(value);

export const eq = (lhs, rhs) => {
  const normalizeOperand = operand => {
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

class Expression {}

class Identifier extends Expression {
  constructor(name) {
    super();
    this.name = name;
  }
  serialize() {
    return `"${this.name}"`;
  }
  clone() {
    return new Identifier(this.name);
  }
}

class RawValue extends Expression {
  constructor(value) {
    super();
    this.value = value;
  }
  serialize() {
    return `'${this.value}'`;
  }
  clone() {
    return new RawValue(this.value);
  }
}

class BinaryExpression extends Expression {
  constructor(op, lhs, rhs) {
    super();
    this.op = op;
    this.lhs = lhs;
    this.rhs = rhs;
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

class Fragment {}

class SelectFragment extends Fragment {
  constructor(columns) {
    super();
    this.columns = columns;
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
  constructor(table) {
    super();
    this.table = table;
  }
  serialize() {
    return `"${this.table}"`;
  }
}

class WhereFragment extends Fragment {
  constructor(expr) {
    super();
    this.expr = expr;
  }
  serialize() {
    return this.expr.serialize();
  }
}

export const select = (...columns) => new SelectFragment(columns);

export const from = table => new FromFragment(table);

export const where = expr => new WhereFragment(expr);

export class Builder {
  constructor(fragments) {
    this.fragments = fragments;
  }
  select(...columns) {
    return new Builder(this.fragments.concat(select(...columns)));
  }
  from(table) {
    return new Builder(this.fragments.concat(from(table)));
  }
  serialize() {
    const columnFragments = this.fragments.filter(
      fragment => fragment instanceof SelectFragment
    );
    const tableFragments = this.fragments.filter(
      fragment => fragment instanceof FromFragment
    );
    const conditionFragments = this.fragments.filter(
      fragment => fragment instanceof WhereFragment
    );

    const serializeFragments = (fragments, joinStr) =>
      fragments.map(fragment => fragment.serialize()).join(joinStr);

    const columns = serializeFragments(columnFragments, ", ");
    const tables = serializeFragments(tableFragments, ", ");
    let conditions = serializeFragments(conditionFragments, " AND ");
    if (conditions) {
      conditions = ` WHERE ${conditions}`;
    }
    return `SELECT ${columns} FROM ${tables}${conditions};`;
  }
}
