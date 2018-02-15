import Fragment from "./fragment";
import wrap from "../util/wrap";

export default class OffsetFragment extends Fragment {
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
    result.query = `OFFSET ${result.query}`;
    return result;
  }
}

export const offset = wrap(OffsetFragment);
