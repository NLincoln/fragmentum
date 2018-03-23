import Fragment from "./fragment";
import wrap from "../util/function-constructor";
import { concatQueries } from "../util/concat-queries";
import { serializeMaybeExpression } from "../util/serializeExpression";
export default class FromFragment extends Fragment {
  constructor(...tables) {
    super();
    this.tables = tables;
  }
  clone() {
    return from(...this.tables);
  }
  serialize() {
    return concatQueries(this.tables.map(serializeMaybeExpression));
  }
}

export const from = wrap(FromFragment);
