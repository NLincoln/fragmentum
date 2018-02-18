import Fragment from "./fragment";
import wrap from "../util/wrap";
import { concatSubQueries } from "./from";

export default class HavingFragment extends Fragment {
  constructor(...exprs) {
    super();
    this.exprs = exprs;
  }
  serialize() {
    return concatSubQueries(
      this.exprs.map(expr => {
        return expr.serialize();
      }),
      " AND "
    );
  }
}

export const having = wrap(HavingFragment);
