import Fragment from "./fragment";
import wrap from "../util/wrap";

const createFragment = append =>
  class extends Fragment {
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
      result.query = `${append} ${result.query}`;
      return result;
    }
  };

export const LimitFragment = createFragment("LIMIT");
export const limit = wrap(LimitFragment);
export const OffsetFragment = createFragment("OFFSET");
export const offset = wrap(OffsetFragment);
