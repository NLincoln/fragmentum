import Fragment from "./fragment";
import wrap from "../util/function-constructor";
import { concatQueries } from "../util/concat-queries";

export default class HavingFragment extends Fragment {
  constructor(...exprs) {
    super();
    this.exprs = exprs;
  }
  serialize() {
    return concatQueries(
      this.exprs.map(expr => {
        return expr.serialize();
      }),
      " AND "
    );
  }
}

export const having = wrap(HavingFragment);
