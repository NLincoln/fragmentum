import Fragment from "./fragment";
import quote from "../util/quote";
import wrap from "../util/function-constructor";
import { Builder } from "../builder";
import { concatQueries } from "../util/concat-queries";

export const serializeTable = table => {
  if (table instanceof Builder) {
    let { query, binds } = table.serialize({ partial: true });
    return {
      query: `(${query}) AS ${quote(table.alias)}`,
      binds
    };
  } else if (table instanceof FromFragment) {
    return table.serialize();
  } else {
    return {
      query: quote(table),
      binds: []
    };
  }
};
export default class FromFragment extends Fragment {
  constructor(...tables) {
    super();
    this.tables = tables;
  }
  clone() {
    return from(...this.tables);
  }
  serialize() {
    return concatQueries(this.tables.map(serializeTable));
  }
}

export const from = wrap(FromFragment);
