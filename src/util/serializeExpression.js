import { Builder } from "../builder";
import Expression from "../expressions/expression";
import FromFragment from "../fragments/from";
import quote from "./quote";
import columnQuote from "./column-quote";

export const serializePair = ([key, alias]) => {
  if (key && alias) {
    return `${columnQuote(key)} AS ${quote(alias)}`;
  }
  return null;
};
const serializeObject = column =>
  Object.keys(column)
    .map(key => serializePair([key, column[key]]))
    .join(", ");

const serializeColumn = column => {
  if (Array.isArray(column)) {
    return serializePair(column);
  } else if (typeof column === "object") {
    return serializeObject(column);
  }
  return columnQuote(column);
};

export const serializeMaybeExpression = column => {
  // Expressions know how to serialize themselves, FromFragment indicates that
  // we have a wrapped subquery, so we just forward that too.
  if (column instanceof Expression || column instanceof FromFragment) {
    return column.serialize();
  } else if (column instanceof Builder) {
    let { query, binds } = column.serialize({ partial: true });
    return {
      query: `(${query}) AS ${quote(column.alias)}`,
      binds
    };
  }
  return {
    query: serializeColumn(column),
    binds: []
  };
};
