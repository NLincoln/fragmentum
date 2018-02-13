import Fragment from "./fragment";
import quote from "../util/quote";
import wrap from "../util/wrap";
import { Builder } from "../builder";

export const concatSubQueries = arr => {
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
    query: reduced.query.filter(f => f).join(", "),
    binds: reduced.binds
  };
};

export default class FromFragment extends Fragment {
  constructor(...tables) {
    super();
    this.tables = tables;
  }
  serialize() {
    const subqueries = concatSubQueries(
      this.tables
        .filter(table => table instanceof Builder)
        .map(builder => {
          let { query, binds } = builder.serialize();
          if (query.endsWith(";")) {
            query = query.slice(0, -1);
          }
          return {
            query: `(${query}) AS ${quote(builder.alias)}`,
            binds
          };
        })
        .concat(
          this.tables
            .filter(table => table instanceof FromFragment)
            .map(fragment => fragment.serialize())
        )
    );

    const strings = this.tables
      .filter(table => typeof table === "string")
      .map(quote);
    return {
      query: [subqueries.query, ...strings].filter(f => f).join(", "),
      binds: subqueries.binds
    };
  }
}

export const from = wrap(FromFragment);
