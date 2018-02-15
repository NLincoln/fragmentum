import Fragment from "./fragment";
import wrap from "../util/wrap";
import Identifier from "../expressions/identifier";

export default class LimitFragment extends Fragment {
  constructor(value) {
    super();
    this.value = value;
  }
  serialize() {
    let result = null;
    if (["string", "number"].includes(typeof this.value)) {
      result = {
        query: String(this.value),
        binds: []
      };
    } else {
      result = this.value.serialize();
    }
    result.query = `LIMIT ${result.query}`;
    return result;
  }
}

export const limit = wrap(LimitFragment);
