import Fragment from "./fragment";
export default class WhereFragment extends Fragment {
  constructor(expr) {
    super();
    this.expr = expr;
  }
  serialize() {
    return this.expr && this.expr.serialize();
  }
}
export const where = expr => new WhereFragment(expr);
