import Fragment from "./fragment";
import wrap from "../util/function-constructor";

export default class SubQueryAliasFragment extends Fragment {
  constructor(name) {
    super();
    this.name = name;
  }
  clone() {
    return alias(this.name);
  }

  serialize() {
    return {
      query: this.name,
      binds: []
    };
  }
}

export const alias = wrap(SubQueryAliasFragment);

export const softAlias = name => alias(name).overridable();
