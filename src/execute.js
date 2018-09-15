import { getFragmentRepr, isFragment } from "./fragment";
import { isArgument, serializeArgument } from "./arg";
import SqlString from "sqlstring";

export function isExecutable(fragment) {
  return Boolean(
    isArgument(fragment) || isFragment(fragment) || typeof fragment === "string"
  );
}

export function execute(fragment, args = {}) {
  if (isFragment(fragment)) {
    let repr = getFragmentRepr(fragment, args);

    return {
      query: repr.serialize(repr),
      binds: {}
    };
  } else if (isArgument(fragment)) {
    let value = serializeArgument(args, fragment);
    /**
     * Have to re-execute the argument's resolved value, because it could be a string
     * or another fragment or anything really.
     */
    value = execute(value).query;
    return {
      query: value,
      binds: {}
    };
  } else if (typeof fragment === "string") {
    return {
      query: SqlString.escapeId(fragment),
      binds: {}
    };
  } else {
    throw new Error(
      `Fragmentum: Attempted to execute something that was not a fragment or argument. ${fragment}`
    );
  }
}
