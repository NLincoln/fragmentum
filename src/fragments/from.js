import Fragment from "./fragment";
import quote from "../util/quote";
import wrap from "../util/wrap";
import { Builder } from "../builder";

export const concatSubQueries = (arr, joinStr = ", ") => {
  const reduced = arr.reduce(
    (prev, curr) => ({
      query: prev.query.concat(curr.query),
      binds: prev.binds.concat(curr.binds)
    }),
    {
      query: [],
      binds: []
    }
  );
  return {
    query: reduced.query.filter(f => f).join(joinStr),
    binds: reduced.binds
  };
};

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
  serialize() {
    return concatSubQueries(this.tables.map(serializeTable));
  }
}

export const from = wrap(FromFragment);
